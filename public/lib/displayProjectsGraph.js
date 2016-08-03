let fileName = '../js/ssProject.json'; // Sample JSON data
let graphData = null;     // Global variable that contains all of the parse JSON data

let clickedOnce = false;  // For monitoring the click event on node
let timer;                // For click event monitoring

let width = 1000;         // D3 window Width
let height = 800;         // D3 window height
let reducedOpacity = 0.2; // highlight opacity to reduce to

let nodesToRender = [];   // Gets passed into the D3 force nodes function
let edgesToRender = [];   // Gets passed into the D3 force links function
let nodeToEdgeMap = {};   // Hold the mapping of node to edges
let items;
let itemRelations;
let projectNode = null;   // The project name node
let node = null;          // The collection of node html objects
let path = null;          // The collection of path html objects

let svg = null;           // The svg window
let force = null;         // The force layout for d3
let relationsChecked = false;   // Flag to see if relations check was run

// Parse the JSON data
d3.json(fileName, function (error, gData) {
  if (error) {
    console.log(error);
  } else {
    graphData = gData; // Pass the value to a global
    items = graphData.nodes;
    itemRelations = graphData.edges;

    // Create a project node and add it to the items list
    projectNode = {id: -1, name: graphData.name, image: '', type: -1};
    items.unshift(projectNode);
    itemRelations.push({id: -1, source: -1, target: rootID, type: -1});

    mapNodesToEdges();

    // rootID is set in the graph view
    filterJSON(rootID); // Filters the JSON for only the downStream items from the selected item
    resetVisitedFlag(); // Sets all of the visited flags to false

    // Append the SVG object to the body
    // Add a group element within it to encompass all the nodes - this fixes the chrome
    svg = d3.select('body').append('svg')
      .attr('width', '100%')
      .attr('height', height)
      .call(d3.behavior.zoom().scaleExtent([1, 10])
        .on('zoom', function () {
          svg.attr('transform', 'translate(' + d3.event.translate + ')' + ' scale(' + d3.event.scale + ')');
        }))
      .on('dblclick.zoom', null)  // To remove the double click zoom function
      .append('g');

    // ============ build the arrows ================
    svg.append('svg:defs').selectAll('marker')
      .data(['end'])      // Different link/path types can be defined here
      .enter().append('svg:marker')    // This section adds in the arrows
      .attr('id', String)
      .attr('viewBox', '0 -5 10 10')
      .attr('refX', 25)
      .attr('refY', -1.5)
      .attr('markerWidth', 6)
      .attr('markerHeight', 6)
      .attr('orient', 'auto')
      .append('svg:path')
      .attr('d', 'M0,-5L10,0L0,5')
      .attr('class', 'arrow');

    force = d3.layout.force()
      .size([width, height])
      .linkDistance(100)  // sets the target distance between linked nodes to the specified value
      .charge(-1000);       // - value results in node repulsion, while + value results in node attraction

    updateGraph(rootID);  // Render the graph
    // collapseAll();
  }
});

/**
 * Maps each node to a node object and all of its upstream and downStream relationships
 * NOTE - nodeToEdgeMap is an array that uses id as the index for direct access
 */
function mapNodesToEdges () {
  items.forEach(function (item) {
    let thisItem = nodeToEdgeMap[item.id] = {};
    thisItem.node = item;
    thisItem.node.downStream = [];

    // thisItem.edges refers to the downStream nodes
    thisItem.edges = itemRelations.filter(function (relItem) {
      relItem.visited = false;
      if (relItem.source === item.id) {
        thisItem.node.downStream.push(relItem.target);  // Add the target to the downStream items
        return relItem; // Filter all of the edges that have this item source id
      }
    });

    thisItem.edgesUpstream = itemRelations.filter(function (relItem) {
      if (relItem.target === item.id) {
        return relItem; // Filter all of the edges that have this item source id
      }
    });

    thisItem.node.downStreamEdges = thisItem.edges;
    thisItem.node.noRelations = (thisItem.edges.length === 0); // Set the no relations flag
    item.visited = false;
  });
}

/**
 * Filters the graph input to be filtered by the rootId and all its downStream nodes
 * @param rootId
 */
function filterJSON (rootId) {
  let thisNode = nodeToEdgeMap[rootId];
  if (!thisNode.node.visited || thisNode.node.visited === 'undefined') {
    thisNode.node.visited = true;
    nodesToRender.push(thisNode.node);

    if (thisNode.edges.length > 0) {
      thisNode.edges.forEach(function (relItem) {
        edgesToRender.push(relItem);
        filterJSON(relItem.target);  // Traverse down the relations
      });
    }
  }
}

/**
 * Updates the graph visuals
 *
 * @param {Integer} passedId is the id of the element that is to be the root node coming off the project node
 */
function updateGraph (passedId = -1) {
  if (!relationsChecked) {
    // For each relationship, add the target to the source node
    itemRelations.forEach(function (relItem) {
      // Find node object based on the relationship source id
      let srcNode = nodeToEdgeMap[relItem.source];
      let trgNode = nodeToEdgeMap[relItem.target];

      // Set the relationship source and target values
      // Note - Use objects only and not just ids of the nodes
      if (srcNode && trgNode) {
        relItem.source = srcNode.node;
        relItem.target = trgNode.node;
        adddownStreamItemToNode(srcNode, relItem);  // Check if downStream items array exists
      }
    });

    // Check if there are relations for each node and set a flag
    items.forEach(function (item) {
      if (typeof item.downStream === 'undefined') {
        item.noRelations = true;
      } else {
        item.noRelations = (item.downStream.length === 0);
      }
    });

    relationsChecked = true;
  }

  // Set the force nodes, edges and start the graph
  force
    // .nodes(graphData.nodes)
    .nodes(nodesToRender)
    // .links(graphData.edges)
    .links(edgesToRender)
    .on('tick', tick)
    .start();

  // ============ edges combined with the arrows ===========
  path = svg.append('svg:g').selectAll('path')
    .data(force.links())
    .enter().append('svg:path')
    .attr('id', function (d) {
      return d.id;  // Add an id element to each edge
    })
    .attr('class', thisPath => {
      let result = 'link';
      // Check the type and add a style according to type
      result = (thisPath.type === -1) ? result + ' link-dot' : result;
      result = (thisPath.type === 8) ? result + ' link-dash' : result;

      return result;
    })
    .attr('marker-end', 'url(#end)');

  // Added a string to edge hover
  path.append('svg:title')
    .text(function (d) {
      return (d.type);
    });

  // ============ Node Properties Definition ===========
  node = svg.selectAll('.node')
    .data(force.nodes())
    .enter()
    .append('g')
    .attr('id', function (d) {
      return d.id;  // Add an id element to each node
    })
    .attr('class', function (thisNode) {
      // Add projectRoot class if the node is the project node
      return thisNode.id === rootID ? 'node projectRoot' : 'node';
    })
    .call(force.drag)
    .on('click', function (d) {
      if (clickedOnce) {
        nodeDoubleClick(d);  // Call the single click function
      } else {
        timer = setTimeout(function () {
          nodeClick(d); // Call the double click function
        }, 175);
        clickedOnce = true;
      }
    });

  projectNode.fixed = true;  // Set the project Node to be fixed and not moving
  projectNode.x = height / 2;
  projectNode.y = width / 2;

  // White rectangle behind text configuration
/*  node.append('rect')
    .attr('x', -8)
    .attr('y', -9)
    .attr('height', 19)
    .attr('width', 120);*/

  // Circle at node behind icon configuration
  node.append('circle')
    .attr('x', '-14px')
    .attr('y', '-14px')
    .attr('r', 13);

  // Image in the node circle configuration
  node.append('image')
    .attr('xlink:href', function (n) {
      return n.image;
    })
    .attr('x', '-9px')
    .attr('y', '-9px')
    .attr('height', '18px')
    .attr('width', '18px');

  // Add Text for hovering that shows full filename
  node.append('svg:title')
    .text(function (d) {
      return (d.id + ' - ' + d.name);
    });

  // Add the name of the node as text
  let nodeText = node.append('text')
    .attr('x', 18)
    .attr('dy', '.35em')
    .attr('class', 'nodeText')
    .text(function (d) {
      // Limit the length of the name text
      return d.name.length > 18 ? d.name.substring(0, 15) + '...' : d.name;
    });

  // ============= Node Path Definitions ==============
  /**
   * For every shift of the graph, this function gets called.
   * It updates the location of the nodes and edges.
   *
   * @param {Object} e
   */
  function tick (e) {
    path.attr('d', function (d) {
      let dx = d.target.x - d.source.x;
      let dy = d.target.y - d.source.y;
      let dr = Math.sqrt(dx * dx + dy * dy);

      return 'M' + d.source.x + ',' + d.source.y + 'A' +
        dr + ',' + dr + ' 0 0,1 ' + d.target.x + ',' + d.target.y;
    });

    // Move the edge depending on node location
    node.attr('transform', function (d) {
      return 'translate(' + d.x + ',' + d.y + ')';
    });

    let k = 10 * e.alpha; // For the node offset

    // This section pushes sources up and targets down to form a weak tree-like structure.
    path.each(function (d) {
      d.source.x -= k;
      d.target.x += k;
    }).attr('x1', function (d) { return d.source.x; })
      .attr('y1', function (d) { return d.source.y; })
      .attr('x2', function (d) { return d.target.x; })
      .attr('y2', function (d) { return d.target.y; });

    // This sets the node position
    node.attr('cx', function (d) { return 5 * d.x; })
        .attr('cy', function (d) { return d.y; });
  }

  //
  // ============ Toggle highlighting nodes on single click ===========
  //
  /**
   * This function handles the logic for highlighting and un-highlighting nodes on single-click
   * @param {Object} d is the node that was just clicked
   */
  function nodeClick (d) {
    d.isSelected = true; // Sets the node you clicked on to have a "selected" flag.
    let highlightedCount = -1; // this will count how many downStream nodes are highlighted.
    highlightedCount = downStreamHighlightCheck(d, highlightedCount);
    // If there are no downStream items and d is highlighted, un-highlight it.
    if (d.isHighlighted) {
      if (d.downStream > 0 && (highlightedCount !== d.downStream.length)) {
        highlightNodes(d);
      } else {
        unHighlightNodes(d);
        checkOpacity();
      }
    } else {
      highlightNodes(d);
    }
    clickedOnce = false;  // This is for resetting the click flag
  }

  /**
   * This function will un-highlight d and the array of downStream nodes for d. This will NOT
   * un-highlight a node if all of it's children are highlighted (cycle checking)
   * @param {object} d is the node that was just clicked
   */
  // TODO : Keep nodes with two highlighted upstream nodes highlighted on un-highlight with a count
  function unHighlightNodes (d) {
    console.log('un-highlight called');
    d.isHighlighted = false;
    node.style('opacity', function (curNode) {
      let count = -1;
      if (d.downStream) {
        for (let i = 0; i < d.downStream.length; i++) {
          if (d.downStream[i] === curNode.id) {
            count = downStreamHighlightCheck(curNode, count); // check downStream items for highlighting
            console.log('count is: ' + count);
          }
          if (count !== curNode.downStream.length && d.downStream[i] === curNode.id) {
            curNode.isHighlighted = false;
          }
        }
      }
      return curNode.isHighlighted ? 1 : reducedOpacity;
    });

    path.style('opacity', function (curPath) {
      return (curPath.source.isHighlighted && curPath.target.isHighlighted) ? 1 : reducedOpacity;
    });
  }

  /**
   * This function will highlight the selected node "d" then highlight the nodes in it's downStream array
   * @param {object} d
   */
  function highlightNodes (d) {
    console.log('highlight invoked');
    d.isHighlighted = true;
    node.style('opacity', function (curNode) {
      if (!d.noRelations) {
        for (let i = 0; i < d.downStream.length; i++) {
          if (d.downStream[i] === curNode.id) {
            console.log('match');
            curNode.isHighlighted = true;
          }
        }
      }
      return curNode.isHighlighted ? 1 : reducedOpacity;
    });

    path.style('opacity', function (curPath) {
      return (curPath.source.isHighlighted && curPath.target.isHighlighted) ? 1 : reducedOpacity;
    });
  }

  /**
   * This function checks all the downStream items of your array to see if they are highlighted. This prevents
   * issues when we have a cycle and are un-highlighting nodes.
   * @param {object} d
   * @param {int} count
   */
  function downStreamHighlightCheck (d, count) {
    // This checks whether we should be highlighting or un-highlighting nodes
    d3.selectAll('g.node')  // Loops through all nodes and checks if they have downStream relations
      .each(function (curNode) {
        for (let i = 0; i < d.downStream.length; i++) {
          // If the index matches and the node is already highlighted, increase our count.
          if (d.downStream[i] === curNode.id) {
            if (curNode.isHighlighted) {
              if (count === -1) {
                count = 1;
              } else {
                count++;
              }
            }
          }
        }
      });
    return count;
  }

  /**
   * This function is to check if all the nodes are un-highlighted. If they are, highlight all the nodes on the graph.
   */
  function checkOpacity () {
    let highlight = false; // flag to see if anyone is highlighted.
    let allNodes = svg.selectAll('.node');
    allNodes[0].forEach(function (d) {
      if (d.__data__.isHighlighted) {
        highlight = true; // If ANY node is highlighted set this flag.
      }
    });
    if (highlight === false) {  // Only executes if ALL nodes are NOT highlighted.
      allNodes.style('opacity', 1); // Turn Everyone on
      svg.selectAll('path').style('opacity', 1); // Turn on all the edges.
    }
  }

  /**
   * Node double click event hides all of the children nodes for double clicked node.
   *
   * @param {Object} clickedNode is the node that was clicked on
   */
  function nodeDoubleClick (clickedNode) {
    // console.log('>>>>>>> Double Click Fired =====');
    // console.log(clickedNode);
    clickedOnce = false;  // For resetting the clickedOnce flag
    clearTimeout(timer);  // Reset the timer for click event

    collapsedownStream(clickedNode.id);   // Traverse down the graph
    resetVisitedFlag();
  }

  /**
   * Adds a downStream item and downStream edge to a given Node
   *
   * @param {Object} nodeItem is a node item
   * @param {Object} edge is an edge object that is going to be added to the nodeItem
   */
  function adddownStreamItemToNode (nodeItem, edge) {
    // Check if downStream items array exists
    if (typeof nodeItem.downStream === 'undefined') {
      nodeItem.downStream = [];
    }
    nodeItem.downStream.push(edge.target);  // Add the target ID to list of downStream items

    // Check if downStream Edges array exists
    if (typeof nodeItem.downStreamEdges === 'undefined') {
      nodeItem.downStreamEdges = [];
    }
    nodeItem.downStreamEdges.push(edge);  // Add the target ID to list of downStream items
    nodeItem.noRelations = false;
  }
}

/**
 * Collapse only the nodes downStream from the given node
 * @param {number} id - is the id of the object
 */
function collapsedownStream (id) {
  // console.log('======> collapsedownStream() ===');
  let thisNode = nodeToEdgeMap[id];

  if (thisNode.edges.length > 0) {
    // console.log('\t--> Collapsing downStream edges...');
    // Hide each downStream edge and recurse to downStream node
    thisNode.edges.forEach(function (relItem) {
      if (!relItem.visited) {
        toggleOpacity(relItem.id);  // Toggle the opacity of the edge
        relItem.visited = true; // Toggle the visited flag
      }

      collapse(relItem.target.id, 0);  // Traverse down the relations
    });
  }
}

/**
 * Collapses all of the graph nodes downStream from the selected node
 *
 * @param {number} id is the object that is selected and whose downStream items will be toggled
 */
function collapse (id, count) {
  // console.log('-- Collapse Initiated [' + count + '] --');
  let thisNode = nodeToEdgeMap[id];

  if (!thisNode.node.visited || thisNode.node.visited === 'undefined') {
    thisNode.node.visited = true;
    count++; // increment the count

    if (thisNode.edgesUpstream.length > 0) {
      // console.log('\t--> Collapsing upstream edges...');
      // hide each upstream edge from this node
      thisNode.edgesUpstream.forEach(function (relItem) {
        if (!relItem.visited) {
          toggleOpacity(relItem.id); // Toggle the opacity of the edge
          relItem.visited = true;  // Toggle the visited flag
        }
      });
    }

    if (thisNode.edges.length > 0) {
      // console.log('\t--> Collapsing downStream edges...');
      // Hide each downStream edge and recurse to downStream node
      thisNode.edges.forEach(function (relItem) {
        if (!relItem.visited) {
          toggleOpacity(relItem.id);  // Toggle the opacity of the edge
          relItem.visited = true; // Toggle the visited flag
        }

        collapse(relItem.target.id, count);  // Traverse down the relations
      });
    }
    toggleOpacity(thisNode.node.id);  // Toggle the visibility of the edge
  }
}

/**
 * Hides all of the graph nodes except the root id
 */
function collapseAll () {
  svg.selectAll('.node').style('opacity', function (item) {
    return item.id !== -1 ? 0 : 1;
  });
  projectNode.downStream.forEach(function (item) {
    d3.select("[id='" + item.id + "']").style('opacity', 1);
  });
  d3.select("[id='" + rootID + "']").style('opacity', 1);  // Show the project node

  let paths = svg.selectAll('path');
  paths.style('opacity', 0);
  projectNode.downStreamEdges.forEach(function (item) {
    d3.select("[id='" + item.id + "']").style('opacity', 1);
  });
}

/**
 * Cycle through all of the nodes and edges and set the visited flag to false
 */
function resetVisitedFlag () {
  nodesToRender.forEach(function (item) { item.visited = false; });
  edgesToRender.forEach(function (item) { item.visited = false; });
}

/**
 * Toggles the opacity of a d3 svg item
 * @param {number} id
 */
function toggleOpacity (id) {
  // console.log('----- toggleOpacity() -----');
  let foundRel;

  if (id && (typeof id === typeof 0)) {
    foundRel = d3.select("[id='" + id + "']");
    if (foundRel[0][0] !== null) {
      foundRel.style('opacity', (foundRel.style('opacity') === 0) ? 1 : 0);
    } else { console.log('toggleOpacity() - item not found'); }
  } else { console.log('toggleOpacity() - item is not a number'); }
}
