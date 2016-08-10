let clickedOnce = false;  // For monitoring the click event on node
let timer;                // For click event monitoring

let width = 1000;         // D3 window Width
let height = 800;         // D3 window height
let reducedOpacity = 0.2; // highlight opacity to reduce to

let nodesToRender = [];   // Gets passed into the D3 force nodes function
let edgesToRender = [];   // Gets passed into the D3 force links function
let nodeToEdgeMap = {};   // Hold the mapping of node to edges

let projectNode = null;   // The project name node
let node = null;          // The collection of node html objects
let path = null;          // The collection of path html objects

let svg = null;           // The svg window
let force = null;         // The force layout for d3
let relationsChecked = false;   // Flag to see if relations check was run

// ////// DEMO VARS//////

let curves = false;
let physics = true;
let itemNames = true;
let floatDown = true;

// /////////////////////

/**
 * Base function to render the graph. It is invoked by the view through an AJAX call after the data has been retrieved.
 * @param graphData
 */
function renderGraph (graphData, rootId) {
  // console.log('---> Graph Data');
  // console.log(graphData);

  insertProjectNode(graphData, rootId);

  mapNodesToEdges(graphData);  // Pre-process data for faster data retrieval
  filterJSON(graphData, rootId); // Filters the JSON for only the downStream nodes from the selected item
  resetVisitedFlag(); // Sets all of the visited flags to false

  configureD3Graph();
  updateGraph(graphData, rootId);  // Render the graph
  collapseAll();  // Collapses all the nodes except the root node
}

/**
 * Adds a project node to the graph
 * @param graphData
 */
function insertProjectNode (graphData, rootId) {
  // Create a project node and add it to the nodes list
  projectNode = {id: -1, name: graphData.name, image: '', type: -1};
  graphData.nodes.unshift(projectNode);

  // Add a relationship from project node to root id if one was passed in
  if (rootId !== -1 && rootId !== null) {
    graphData.edges.push({id: -1, source: -1, target: rootId, type: -1});
  }
}

/**
 * Configures the D3 force layout graph by appending it to the body and setting its properties
 */
function configureD3Graph () {
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
    .attr('refX', 21)
    .attr('refY', -0.5)
    .attr('markerWidth', 6)
    .attr('markerHeight', 6)
    .attr('orient', 'auto')
    .append('svg:path')
    .attr('d', 'M0,-5L10,0L0,5')
    .attr('class', 'arrow');

  force = d3.layout.force()
    .size([width, height])
    .linkDistance(100);  // sets the target distance between linked nodes to the specified value
  // .charge(-2000);       // - value results in node repulsion, while + value results in node attraction
}

/**
 * Maps each node to a node object and all of its upstream and downStream relationships
 * NOTE - nodeToEdgeMap is an array that uses id as the index for direct access
 * @param {object} graphData
 */
function mapNodesToEdges (graphData) {
  graphData.nodes.forEach(function (item) {
    let thisItem = nodeToEdgeMap[item.id] = {};
    thisItem.node = item;
    thisItem.node.isCollapsed = true;
    thisItem.node.isVisible = false;
    thisItem.node.downStream = [];

    // thisItem.edges refers to the downStream nodes
    thisItem.edges = graphData.edges.filter(function (relItem) {
      relItem.visited = false;
      if (relItem.source === item.id) {
        thisItem.node.downStream.push(relItem.target);  // Add the target to the downStream nodes
        return relItem; // Filter all of the edges that have this item source id
      }
    });

    thisItem.edgesUpstream = graphData.edges.filter(function (relItem) {
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
 * @param {number} id
 * @param {object} graphData
 */
function filterJSON (graphData, rootId) {
  if (rootId !== -1 && rootId !== null) {
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
  } else {
    nodesToRender = graphData.nodes;
    edgesToRender = graphData.edges;
  }
}

/**
 * Updates the graph visuals by setting the data and configuring the nodes and edges
 * @param {object} graphData
 * @param {integer} rootId is the id of the element that is to be the root node coming off the project node
 */
function updateGraph (graphData, rootId = -1) {
  if (!relationsChecked) {
    // For each relationship, add the target to the source node
    graphData.edges.forEach(function (relItem) {
      // Find node object based on the relationship source id
      let srcNode = nodeToEdgeMap[relItem.source];
      let trgNode = nodeToEdgeMap[relItem.target];

      // Set the relationship source and target values
      // Note - Use objects only and not just ids of the nodes
      if (srcNode && trgNode) {
        relItem.source = srcNode.node;
        relItem.target = trgNode.node;
        adddownStreamItemToNode(srcNode, relItem);  // Check if downStream nodes array exists
      }
    });

    // Check if there are relations for each node and set a flag
    graphData.nodes.forEach(function (item) {
      if (typeof item.downStream === 'undefined') {
        item.noRelations = true;
      } else {
        item.noRelations = (item.downStream.length === 0);
      }
    });

    relationsChecked = true;
  }

  force  // Set the force nodes, edges and start the graph
    .nodes(nodesToRender)  // .nodes(graphData.nodes)
    .links(edgesToRender) // .links(graphData.edges)
    .charge(function (d) {  // Variable Charge
      let chargeVal = -500;
      return chargeVal + (-200 * d.downStream.length);
    })
    .linkStrength(function (d) {  // Variable link Strength
      let strengthVal = 1;
      return strengthVal + (-0.12 * (d.source.downStream.length));
    })
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
      result = (thisPath.suspect) ? result + ' suspect' : result;  // Check the type and add a style according to type

      return result;
    })
    .attr('marker-end', 'url(#end)');

  path.append('svg:title')  // Added a string to edge hover
    .text(function (d) {
      let strTitle = d.type;
      if (d.suspect) {
        strTitle = strTitle + ' - Suspect';
      }
      return strTitle;
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
      let strClass = 'node';

      if (thisNode.id === rootId || thisNode.id === -1) {
        strClass = strClass + ' projectRoot';
      }

      if (thisNode.downStream && thisNode.downStream.length > 0) {
        strClass = strClass + ' hasDownstream';
      }
      return strClass;
    })
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

  // Activate the physics if the physics flag is set
  if (physics) {
    node.call(force.drag);
  }

  projectNode.fixed = true;  // Set the project Node to be fixed and not moving
  projectNode.x = height / 2;
  projectNode.y = width / 2;

  // node.append('rect'); // White rectangle behind text configuration

  node.append('circle') // Circle at node behind icon configuration
    .attr('x', '-14px')
    .attr('y', '-14px')
    .attr('r', 13);

  node.append('image') // Image in the node circle configuration
    .attr('xlink:href', function (n) {
      return n.image;
    })
    .attr('x', '-9px')
    .attr('y', '-9px');

  node.append('svg:title')  // Add Text for hovering that shows full filename
    .text(function (d) {
      return (d.id + ' - ' + d.name);
    });

  if (itemNames) {
    node.append('text') // Add the name of the node as text
    .attr('class', 'nodeText')
    .attr('x', function (d) {
      return d.downStream.length > 0 ? 0 : 20; // Move text to right if the node has downstream items
    })
    .attr('dy', function (d) {
      return d.downStream.length > 0 ? 30 : 0; // Move text down if the node has downstream items
    })
    .attr('text-anchor', function (d) {
      return d.downStream.length > 0 ? 'middle' : 'right';
    })
    .text(function (d) { // Limit the length of the name text
      return d.name.length > 18 ? d.name.substring(0, 15) + '...' : d.name;
    });
  } else {
    node.append('text') // Add the name of the node as text
  // .attr('x', 20)
    .attr('x', 0)
    .attr('dy', 30)
    .attr('class', 'nodeText')
    .attr('text-anchor', 'middle')
    .text(function (d) { // Limit the length of the name text
      return d.name.length > 18 ? d.name.substring(0, 15) + '...' : d.name;
    });
  }

  // Add a downstream item count circle to each node that has downstream items
  let downStreamNodes = d3.selectAll('.node.hasDownstream')
    .append('g')
      .attr('class', 'downsteamCount');
  downStreamNodes.append('circle')
      .attr('cx', '9px')
      .attr('cy', '-10px')
      .attr('r', 8);
  downStreamNodes.append('text')
      .attr('class', 'downstreamCountText')
      .attr('x', '9px')
      .attr('dy', '-6px')
      .attr('text-anchor', 'middle')
      .text(function (d) {
        return d.downStream.length;
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
      if (curves) {
        return curvedEdges(d);
      } else {
        return straightEdges(d);
      }
    });

    // Move the edge depending on node location
    node.attr('transform', function (d) {
      return 'translate(' + d.x + ',' + d.y + ')';
    });

    floatDown ? floatNodesDown(e) : floatNodesRight(e);  // Toggle the float down and the float right

    // Set the node position
    node.attr('cx', function (d) { return 5 * d.x; })
        .attr('cy', function (d) { return d.y; });
  }

  /**
   * Returns a curved line parameter for edge
   * @param d
   * @returns {string}
   */
  function curvedEdges (d) {
    let dx = d.target.x - d.source.x;
    let dy = d.target.y - d.source.y;
    let dr = Math.sqrt(dx * dx + dy * dy);

    return 'M' + d.source.x + ',' + d.source.y + 'A' +
      dr + ',' + dr + ' 0 0,1 ' + d.target.x + ',' + d.target.y;
  }

  /**
   * Returns a straight line parameter for edge
   * @param d
   * @returns {string}
   */
  function straightEdges (d) {
    return 'M' + d.source.x + ',' + d.source.y +
      'S' + d.source.x + ',' + d.source.y +
      ' ' + d.target.x + ',' + d.target.y;
  }

  /**
   * Float the nodes to the right of their upstream node
   */
  function floatNodesRight (e) {
    let offset = 10 * e.alpha; // For the node offset

    // This section pushes sources up and targets down to form a weak tree-like structure.
    path.each(function (d) {
      d.source.x -= offset;  // Offset sources left
      d.target.x += offset;  // Offset target right
    }).attr('x1', function (d) { return d.source.x; })
      .attr('y1', function (d) { return d.source.y; })
      .attr('x2', function (d) { return d.target.x; })
      .attr('y2', function (d) { return d.target.y; });
  }

  /**
   * Float the nodes to the bottom of their upstream node
   */
  function floatNodesDown (e) {
    var offset = 10 * e.alpha; // For the node offset

    path.each(function (d) {
      d.source.y -= offset;  // Offset sources up
      d.target.y += offset;  // Offset targets down
    }).attr('x1', function (d) { return d.source.x; })
      .attr('y1', function (d) { return d.source.y; })
      .attr('x2', function (d) { return d.target.x; })
      .attr('y2', function (d) { return d.target.y; });

    node.attr('cx', function (d) { return d.x; })
        .attr('cy', function (d) { return d.y; });
  }

  //
  // ============ Toggle highlighting nodes on single click ===========
  //
  /**
   * Handles the logic for highlighting and un-highlighting nodes on single-click
   * @param {Object} d is the node that was just clicked
   */
  function nodeClick (d) {
    d.isSelected = true; // Sets the node you clicked on to have a "selected" flag.
    let highlightedCount = -1; // this will count how many downStream nodes are highlighted.
    highlightedCount = downStreamHighlightCheck(d, highlightedCount);
    // If there are no downStream nodes and d is highlighted, un-highlight it.
    if (d.isHighlighted) {
      if (d.downStream.length > 0 && (highlightedCount !== d.downStream.length)) {
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
   * Un-highlight the clicked node (d) and the array of downStream nodes for it. This will NOT
   * un-highlight a node if all of it's children are highlighted (cycle checking)
   * @param {object} d is the node that was just clicked
   */
  // TODO : Keep nodes with two highlighted upstream nodes highlighted on un-highlight with a count
  function unHighlightNodes (d) {
    d.isHighlighted = false;
    node.style('opacity', function (curNode) {
      let count = -1;
      if (d.downStream) {
        for (let i = 0; i < d.downStream.length; i++) {
          if (d.downStream[i] === curNode.id) {
            count = downStreamHighlightCheck(curNode, count); // check downStream nodes for highlighting
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
   * Highlight the selected node "d" then highlight the nodes in it's downStream array
   * @param {object} d
   */
  function highlightNodes (d) {
    d.isHighlighted = true;
    node.style('opacity', function (curNode) {
      if (!d.noRelations) {
        for (let i = 0; i < d.downStream.length; i++) {
          if (d.downStream[i] === curNode.id) {
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
   * Check all the downStream nodes of your array to see if they are highlighted. This prevents
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
   * Check if all the nodes are un-highlighted. If they are, highlight all the nodes on the graph.
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
      d3.selectAll('path').style('opacity', 1); // Turn on all the edges.
    }
  }

  /**
   * Node double click event hides all of the children nodes for double clicked node.
   *
   * @param {Object} clickedNode is the node that was clicked on
   */
  function nodeDoubleClick (clickedNode) {
    console.log('>>>>>>> Double Click Fired =====');
    console.log(clickedNode);
    clickedOnce = false;  // For resetting the clickedOnce flag
    clearTimeout(timer);  // Reset the timer for click event

    collapseDownStream(clickedNode.id);   // Traverse down the graph
    resetVisitedFlag();
  }

  /**
   * Adds a downStream item and downStream edge to a given Node
   *
   * @param {Object} nodeItem is a node item
   * @param {Object} edge is an edge object that is going to be added to the nodeItem
   */
  function adddownStreamItemToNode (nodeItem, edge) {
    // Check if downStream nodes array exists
    if (typeof nodeItem.downStream === 'undefined') {
      nodeItem.downStream = [];
    }
    nodeItem.downStream.push(edge.target);  // Add the target ID to list of downStream nodes

    // Check if downStream Edges array exists
    if (typeof nodeItem.downStreamEdges === 'undefined') {
      nodeItem.downStreamEdges = [];
    }
    nodeItem.downStreamEdges.push(edge);  // Add the target ID to list of downStream nodes
    nodeItem.noRelations = false;
  }
}

/**
 * Collapse only the nodes downStream from the given node
 * @param {number} id - is the id of the object
 */
function collapseDownStream (id) {
  console.log('======> collapseDownStream() ===');
  let thisNode = nodeToEdgeMap[id];
  console.log(thisNode);

  if (thisNode.edges.length > 0) {
    if (thisNode.node.isCollapsed === true) {
      unCollapse(id);
      thisNode.node.isCollapsed = false;
      console.log('unCollapse Completed');
      console.log(thisNode);
    } else {
      console.log('\t--> collapseDownStream() ---> Collapsing downStream edges...');
      // Hide each downStream edge and recurse to downStream node
      thisNode.edges.forEach(function (relItem) {
        collapse(relItem.target.id, 0);  // Traverse down the relations
        if (!relItem.visited) {
          setOpacity(relItem.id, 0);  // Toggle the opacity of the edge
          relItem.visited = true; // Toggle the visited flag
        }
      });

      thisNode.node.isCollapsed = true;
      console.log('Collapse Completed');
      console.log(thisNode);
    }
  }
}

/**
 * Collapses all of the graph nodes downStream from the selected node
 * @param {number} id is the object that is selected and whose downStream nodes will be toggled
 */
function collapse (id, count) {
  console.log('-- collapse() [' + count + '] --');
  let thisNode = nodeToEdgeMap[id];
  console.log(thisNode);

  if (!thisNode.node.visited || thisNode.node.visited === 'undefined') {
    thisNode.node.visited = true;
    count++; // increment the count

    if (thisNode.node.isCollapsed === false) {
      if (thisNode.edges.length > 0) {
        console.log('\t--> collapse() --> Collapsing downStream edges...');
        // Hide each downStream edge and recurse to downStream node
        thisNode.edges.forEach(function (relItem) {
          if (!relItem.visited) {
            setOpacity(relItem.id, 0);  // Toggle the opacity of the edge
            relItem.visited = true; // Toggle the visited flag
          }

          collapse(relItem.target.id, count);  // Traverse downstream nodes
        });
      }

      if (thisNode.edgesUpstream.length > 0) {
        console.log('\t--> collapse() --> Collapsing upstream edges...');
        // hide each upstream edge from this node
        thisNode.edgesUpstream.forEach(function (relItem) {
          if (relItem.target.visited) {
            setOpacity(relItem.id, 0); // set the opacity of the edge to 0
            relItem.visited = true;  // Toggle the visited flag
          }
        });
      }
    }

    setOpacity(thisNode.node.id, 0);  // Toggle the visibility of the edge
  }

  thisNode.node.isCollapsed = true;
}

function unCollapse (id) {
  console.log('-- unCollapse() --');
  let thisNode = nodeToEdgeMap[id];
  console.log(thisNode);

  if (thisNode.edges.length > 0) {
    console.log('\t--> collapseDownStream() ---> Collapsing downStream edges...');
    // Hide each downStream edge and recurse to downStream node
    thisNode.edges.forEach(function (relItem) {
      let foundRel = d3.select("[id='" + relItem.id + "']");
      let foundNode = d3.select("[id='" + relItem.target.id + "']");

      if (foundRel[0][0] !== null) {
        foundRel.style('opacity', 1);
      } else { console.log('item not found'); }

      if (foundNode[0][0] !== null) {
        foundNode.style('opacity', 1);
      } else { console.log('item not found'); }

      relItem.target.visited = true; // Toggle the visited flag
    });

    thisNode.node.isCollapsed = false;
    console.log(thisNode);
  }
}

/**
 * Hides all of the graph nodes except the root id
 */
function collapseAll () {
  // Set all nodes to be invisible
  svg.selectAll('.node').style('opacity', 0);
  d3.select('.projectRoot').style('opacity', 1);  // Set the root node to be visible
  path.style('opacity', 0);
}

/**
 * Cycle through all of the nodes and edges and set the visited flag to false
 */
function resetVisitedFlag () {
  nodesToRender.forEach(function (item) { item.visited = false; });
  edgesToRender.forEach(function (item) { item.visited = false; });
}

// /**
//  * Toggles the opacity of a d3 svg item
//  * @param {number} id
//  */
// function toggleOpacity (id) {
//   // console.log('----- toggleOpacity() -----');
//   let foundRel;
//
//   if (id && (typeof id === typeof 0)) {
//     foundRel = d3.select("[id='" + id + "']");
//     if (foundRel[0][0] !== null) {
//       foundRel.style('opacity', (foundRel.style('opacity') > 0) ? 0 : 1);
//     } else { console.log('toggleOpacity() - item not found'); }
//   } else { console.log('toggleOpacity() - item is not a number'); }
// }

function setOpacity (id, opac) {
  // console.log('----- toggleOpacity() -----');
  let foundRel;

  if (id && (typeof id === typeof 0)) {
    foundRel = d3.select("[id='" + id + "']");
    if (foundRel[0][0] !== null) {
      foundRel.style('opacity', opac);
    } else { console.log('setOpacity() - item not found'); }
  } else { console.log('setOpacity() - item is not a number'); }
}
