/* global d3*/
/* exported renderGraph */
let clickedOnce = false;  // For monitoring the click event on node
let timer;                // For click event monitoring
const projectRootId = -1; // Default value for project node

let width = 1000;         // D3 window Width
let height = 800;         // D3 window height
let reducedOpacity = 0.2; // highlight opacity to reduce to

let nodesToRender = [];   // Gets passed into the D3 force nodes function
let edgesToRender = [];   // Gets passed into the D3 force links function
let nodeToEdgeMap = {};   // Hold the mapping of node to edges

let projectNode = null;   // The project name node
let node = null;          // The collection of node html objects
let path = null;          // The collection of path html objects
let nodeInfoTip = null; // The node information panel that displays on mouse over

let svg = null;           // The svg window
let force = null;         // The force layout for d3
let relationsChecked = false;   // Flag to see if relations check was run

let currentProjectId;
let currentRootId;
let debug = true;         // To display the function console logs

// ////// DEMO VARS//////

// let allCollapsed = false;
let curves = false;
let physics = false;
let itemNames = true;
let floatDown = true;

// /////////////////////

/**
 * Initialize by adding a project node and mapping the nodes and edges.
 * @param graphData
 * @param rootId
 */
function initializeGraphData (graphData, rootId) {
  insertProjectNode(graphData, rootId);
  mapNodesToEdges(graphData);  // Pre-process data for faster data retrieval
}

/**
 * Base function to render the graph. It is invoked by the view through an AJAX call after the data has been retrieved.
 * @param graphData
 */
// eslint-disable-next-line no-unused-vars
export default function renderGraph (graphData, selectedProjectId, rootId) {
  if (debug) {
    // console.log('Root ID: ' + rootId + '  CurrentRootId: ' + currentRootId);
    // console.log('Project ID: ' + selectedProjectId + '  CurrentProjectId: ' + currentProjectId);
  }

  if (currentProjectId !== selectedProjectId) {
    initializeGraphData(graphData, rootId);
    currentProjectId = selectedProjectId;
  }

  if (debug) {
    // console.log(nodeToEdgeMap[rootId]);
  }

  if (rootId !== currentRootId) {
    clearGraph(); // Clear all of the graph data
    filterJSON(graphData, rootId); // Filters the JSON for only the downStream nodes from the selected item
    resetVisitedFlag(); // Sets all of the visited flags to false

    configureD3Graph();
    updateGraph(graphData, rootId);  // Render the graph

    // Collapses all the nodes except the root node
    // NOTE - If you collapse all, then you need to set the isVisible = false and isCollapsed = true
    // default values in mapNodesToEdges()
    // collapseAll(rootId);

    updateOpacity();
    currentRootId = rootId;
  }
}

/**
 * Adds a project node to the graph
 * @param graphData
 */
function insertProjectNode (graphData, rootId) {
  // Create a project node and add it to the nodes list
  projectNode = {id: projectRootId, name: graphData.name, image: '', type: -1};
  graphData.items.unshift(projectNode);

  // Add a relationship from project node to root id if one was passed in
  if (debug) {
    console.log('insertProjectNode() ===> rootID=' + rootId);
  }

  if (rootId && rootId !== projectRootId) {
    graphData.relationships.push({id: projectRootId, source: projectRootId, target: rootId, type: -1});
  }
}

/**
 * Configures the D3 force layout graph by appending it to the body and setting its properties
 */
function configureD3Graph () {
  // Append the SVG object to the body
  // Add a group element within it to encompass all the nodes - this fixes the chrome
  svg = d3.select('#d3Container').append('svg')
    .attr('id', 'graphSVG')
    .attr('width', '100%')
    .attr('height', height)
    .call(d3.behavior.zoom().scaleExtent([1, 10])
      .on('zoom', function () {
        svg.attr('transform', 'translate(' + d3.event.translate + ')' + ' scale(' + d3.event.scale + ')');
      }))
    .on('dblclick.zoom', null)  // To remove the double click zoom function
    .append('g');

  // ============ build the arrows ================
  let arrowData = [
    { id: 'arr', name: 'arrow', path: 'M0,-5L10,0L0,5', viewbox: '0 -5 10 10', class: 'arrow'},
    { id: 'arr-sus', name: 'arrow-suspect', path: 'M0,-5L10,0L0,5', viewbox: '0 -5 10 10', class: 'arrow-suspect'},
  ];
  svg.append('svg:defs').selectAll('marker')
    .data(arrowData)      // Different link/path types can be defined here
    .enter().append('svg:marker')    // This section adds in the arrows
    .attr('id', function(d) { return 'marker-' + d.name })
    .attr('viewBox', function(d) { return d.viewbox })
    .attr('refX', 28)
    .attr('refY', 0)
    .attr('markerWidth', 4)
    .attr('markerHeight', 4)
    .attr('orient', 'auto')
    .append('svg:path')
    .attr('d', function(d) { return d.path })
    .attr('class', function(d) { return d.class });

  nodeInfoTip = d3.select('body').append('div')
    .attr('class', 'nodeInfoTip')
    .text('');

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
  graphData.items.forEach(function (item) {
    let thisItem = nodeToEdgeMap[item.id] = {};
    thisItem.node = item;
    thisItem.node.isCollapsed = false;
    thisItem.node.isVisible = true;
    thisItem.node.isHighlighted = false;
    thisItem.node.downStream = [];

    // thisItem.edges refers to the downStream nodes
    thisItem.edges = graphData.relationships.filter(function (relItem) {
      relItem.visited = false;
      if (relItem.source === item.id) {
        thisItem.node.downStream.push(relItem.target);  // Add the target to the downStream nodes
        return relItem; // Filter all of the edges that have this item source id
      }
    });

    thisItem.edgesUpstream = graphData.relationships.filter(function (relItem) {
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
 * @param {number} rootId
 * @param {object} graphData
 */
function filterJSON (graphData, rootId) {
  if (debug) {
    console.log('Filter JSON: rootid = ' + rootId);
  }

  if (rootId && rootId !== projectRootId) {
    filterJSONRecursive(nodeToEdgeMap[rootId]);
  } else {
    nodesToRender = graphData.items;
    edgesToRender = graphData.relationships;
  }
}

/**
 * Filter Recursion function to traverse through the downstream elements of the selected root node
 * @param thisNode
 */
function filterJSONRecursive (thisNode) {
  if (debug) {
    console.log('filterJSONRecursive(thisNode)');
  }

  if (!thisNode.node.visited || thisNode.node.visited === 'undefined') {
    thisNode.node.visited = true;
    nodesToRender.push(thisNode.node);

    if (thisNode.edges.length > 0) {
      thisNode.edges.forEach(function (relItem) {
        edgesToRender.push(relItem);
        filterJSONRecursive(nodeToEdgeMap[relItem.target]);  // Traverse down the relations
      });
    }
  }
}

/**
 * Clear the SVG object from the graphContainer and the data for the nodes, edges
 */
function clearGraph () {
  if (debug) {
    console.log('clearGraph()');
  }

  nodesToRender = [];
  edgesToRender = [];
  let graphSVG = document.getElementById('graphSVG');
  if (graphSVG) {
    graphSVG.remove();
  }
}

/**
 * Updates the graph visuals by setting the data and configuring the nodes and edges
 * @param {object} graphData
 * @param {integer} rootId is the id of the element that is to be the root node coming off the project node
 */
function updateGraph (graphData, rootId = projectRootId) {
  if (debug) {
    console.log('updateGraph()');
  }

  if (!relationsChecked) {
    // For each relationship, add the target to the source node
    graphData.relationships.forEach(function (relItem) {
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
    graphData.items.forEach(function (item) {
      if (typeof item.downStream === 'undefined') {
        item.noRelations = true;
      } else {
        item.noRelations = (item.downStream.length === 0);
      }
    });

    relationsChecked = true;
  }

  if (debug) {
    console.log(nodesToRender);
    console.log(edgesToRender);
  }

  force  // Set the force nodes, edges and start the graph
    .nodes(nodesToRender)  // .nodes(graphData.items)
    .links(edgesToRender) // .links(graphData.relationships)
    .charge(function (d) {  // Variable Charge
      let chargeVal = -500;
      return d.downStream ? chargeVal + (-200 * d.downStream.length) : chargeVal - 200;
    })
    .linkStrength(function (d) {  // Variable link Strength
      let strengthVal = 1;
      return d.downStream ? strengthVal + (-0.12 * (d.source.downStream.length)) : strengthVal - 0.12;
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
    .attr('marker-end', function (d) { return d.suspect ? 'url(#marker-arrow-suspect)' : 'url(#marker-arrow)' });

  path.append('svg:title')  // Added a string to edge hover
    .text(function (d) {
      let strTitle = d.id + ' ==> ' + d.type;
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

      if (thisNode.id === rootId || thisNode.id === projectRootId) {
        strClass = strClass + ' projectRoot';
      }

      if (thisNode.downStream && thisNode.downStream.length > 0) {
        strClass = strClass + ' hasDownstream';
      }
      return strClass;
    })
    .on('mouseover', nodeMouseOver)
    .on('mouseout', nodeMouseOut)
    .on('click', function (d) {
      if (clickedOnce) {  // This only occurs if someone clicks twice before the timeout below
        nodeDoubleClick(d);  // Call the double click function
      } else {              // We've seen a single click
        d3.selectAll('.activeNode').classed('activeNode', false);
        d3.select(this).classed('activeNode', true);
        if (d3.event.shiftKey) {  // If we see a click with a shift...
          nodeClick(d);  // Call nodeClick() to check (un)highlighting
        } else {
          timer = setTimeout(function () { // If we just see a click check for double click
            clickedOnce = false;  // We timed out after 175ms so we are NOT seeing a double click
          }, 175);
          clickedOnce = true; // We set clickedOnce to true, if we see another click before timeout, it's a double
        }
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
      .attr('class', 'downstreamCount');
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

// ============ Click events for nodes =============

/**
 * Mouse over event for node object that displays a tooltip and changes node circle size to a larger radius
 * @param overNode
 */
function nodeMouseOver (overNode) {
  d3.select(this).classed('hoverOver', true);
  // Make the node circle larger and change opacity
  d3.select(this).select('circle').transition()
    .duration(500)
    .attr('r', 17)
    .attr('opacity', 1);

  let idVal = overNode.id >= 0 ? overNode.id + ' - ' : '';
  let imageVal = overNode.image ? '<img src="' + overNode.image + '">' : '';
  let nodeText = '<h5>' + imageVal + idVal + overNode.name + '</h5>';

  if (overNode.description) {
    let strDesc = overNode.description.length > 100 ? overNode.description.substring(0, 100) + '...' : overNode.description;
    nodeText = nodeText + '<div class="content">' + strDesc + '</div>';
  }

  // Set the tip html and position
  nodeInfoTip.html(nodeText)
    .style('left', (d3.event.pageX) + 'px')
    .style('top', (d3.event.pageY + 30) + 'px')
    .style('visibility', 'visible');
}

/**
 * Mouse out event for node object that hides a tooltip and changes node circle back to original size
 * @param overNode
 */
function nodeMouseOut (overNode) {
  d3.select(this).select('circle').transition()
    .duration(500)
    .attr('r', 13)
    .attr('opacity', 1);

  d3.select(this).classed('hoverOver', false);

  nodeInfoTip.html('')
    .style('visibility', 'hidden');
}

//
// ============ Toggle highlighting nodes on single click ===========
//
/**
 * Handles the logic for highlighting and un-highlighting nodes on single-click
 * @param {Object} d is the node that was just clicked
 */
function nodeClick (d) {
  if (debug) {
    console.log('===============> nodeClick');
  }

  let highlightedCount = 0; // this will count how many downStream nodes are highlighted.
  if (d.downStream.length > 0) {
    let selectedNode = nodeToEdgeMap[d.id];
    selectedNode.edges.forEach(function (item) {
      if (item.target.isHighlighted) {
        highlightedCount++;
      }
    });
  }

  // highlightedCount = downStreamHighlightCheck(d, highlightedCount);
  if (d.isHighlighted) {
    // If the downstream items are not all highlighted, then we highlight all of them
    // Otherwise unHighlight all of them
    if (d.downStream.length > 0 && (highlightedCount !== d.downStream.length)) {
      highlightNodes(d);
    } else {
      unHighlightNodes(d);
    }
  } else {
    highlightNodes(d);
  }
  updateOpacity();
  // Check Opacity only makes changes if ALL the nodes are unhighlighted.
  resetVisitedFlag();
}

/**
 * Un-highlight the clicked node (d) and the array of downStream nodes for it. This will NOT
 * un-highlight a node if all of it's children are highlighted (cycle checking)
 * @param {object} d is the node that was just clicked
 */
// TODO : Keep nodes with two highlighted upstream nodes highlighted on un-highlight with a count
function unHighlightNodes (d) {
  if (debug) {
    console.log('====> unHighlightNodes()');
  }

  // unhighlight the clicked node
  d.isHighlighted = false;
  d.visited = true;
  let count = -1; // used to check if the downstream nodes should be highlighted.
  if (d.downStream.length > 0) {
    d.downStream.forEach(function (curID) {
      let curNode = nodeToEdgeMap[curID];
      curNode.node.visited = true;
      // If a node exists and it has downstream items, we need to see if they are all highlighted.
      if (typeof curNode.node.downStream !== 'undefined' && curNode.node.downStream.length > 0) {
        count = downStreamHighlightCheck(curNode, count); // check downStream nodes for highlighting
      }
      if (count !== curNode.node.downStream.length) { // If all the downstream nodes were not highlighted, we can unhighlight this node
        curNode.node.isHighlighted = false;
      } else {
        curNode.downStream.forEach(function (dItem) {
          nodeToEdgeMap[dItem.id].node.isHighlighted = true;
        });
      }
    });
  }
}

/**
 * Check all the downStream nodes of your array to see if they are highlighted. This prevents
 * issues when we have a cycle and are un-highlighting nodes.
 * @param {object} d
 * @param {int} count
 */
function downStreamHighlightCheck (d, count) {
  if (debug) {
    console.log('====> downStreamHighlightCheck()');
  }

  count = -1;
  // This checks whether we should be highlighting or un-highlighting nodes by counting the number of downstream
  // nodes that are highlighted and returning that count.
  if (d.downStream.length > 0) {
    d.downStream.forEach(function (curID) {
      let curNode = nodeToEdgeMap[curID.id];
      // The 'visited' flag is true when a node that WAS highlighted had been flipped to being UnHighlighted.
      if ((curNode.edges && curNode.node.isHighlighted) || curNode.node.visited) {
        count = (count === -1) ? 1 : count + 1;
      }
      curID.visited = true;
    });

    if (debug) {
      console.log('count is: ' + count);
      console.log('downstream length is: ' + d.downStream.length);
    }

    return count;
  }
}

/**
 * Highlight the selected node "d" then highlight the nodes in it's downStream array
 * @param {object} d
 */
function highlightNodes (d) {
  // Highlight the selected node
  d.isHighlighted = true;
  // if it has downstream nodes find them and highlight them
  if (d.downStream.length > 0) {
    d.downStream.forEach(function (curID) {
      let curNode = nodeToEdgeMap[curID];
      curNode.node.isHighlighted = true;
    });
  }
}

/**
 * Node double click event hides all of the children nodes for double clicked node.
 *
 * @param {Object} clickedNode is the node that was clicked on
 */
function nodeDoubleClick (clickedNode) {
  if (debug) {
    console.log('===============> Double Click Fired on ' + clickedNode.id);
    // console.log(clickedNode);
  }

  clickedOnce = false;  // For resetting the clickedOnce flag
  clearTimeout(timer);  // Reset the timer for click event
  if (clickedNode.isCollapsed) {
    if (clickedNode.downStream.length > 0) {
      unCollapse(clickedNode.id);
    }
  } else {
    if (clickedNode.downStream.length > 0) {
      clickedNode.downStream.forEach(function (item) {
        collapse(item);
      });
      clickedNode.isCollapsed = true;
    }
  }
  resetVisitedFlag();
  updateOpacity();
}

/**
 * Collapses all of the graph nodes downStream from the selected node
 * @param {number} id is the object that is selected and whose downStream nodes will be toggled
 */
function collapse (id) {
  if (debug) {
    console.log('-- collapse *' + id);
  }

  let thisNode = nodeToEdgeMap[id];
  if (!thisNode.node.visited || thisNode.node.visited === 'undefined') {
    thisNode.node.visited = true;

    if (!thisNode.node.isCollapsed) {
      if (thisNode.edges.length > 0) {
        // Hide each downStream edge and recurse to downStream node
        thisNode.edges.forEach(function (relItem) {
          if (!relItem.visited) {
            relItem.isCollapsed = true;
            relItem.isVisible = false;
            relItem.visited = true; // Toggle the visited flag
          }

          collapse(relItem.target.id);  // Traverse downstream nodes
          relItem.target.isVisible = false;
        });
      }
    }
    thisNode.node.isCollapsed = true;
    thisNode.node.isVisible = false;
  }
}

/**
 * Uncollapses the node with the given id.
 * @param id
 */
function unCollapse (id) {
  if (debug) {
    // console.log('-- unCollapse() --');
  }

  let thisNode = nodeToEdgeMap[id];

  if (thisNode.edges.length > 0) {
    // Hide each downStream edge and recurse to downStream node
    thisNode.edges.forEach(function (relItem) {
      relItem.target.isVisible = true;
    });
    thisNode.node.isCollapsed = false;
  }
  thisNode.node.isVisible = true;
}

/**
 * Hides all of the graph nodes except the root id
 */

/**
 * Cycle through all of the nodes and edges and set the visited flag to false
 */
function resetVisitedFlag () {
  if (debug) {
    console.log('resetVisitedFlag()');
  }

  nodesToRender.forEach(function (item) { item.visited = false; });
  edgesToRender.forEach(function (item) { item.visited = false; });
}

/**
 * Updates the opacity of all the nodes and edges based on their current flags.
 */
function updateOpacity () {
  if (debug) {
    console.log('updateOpacity()');
  }

  // Node checking
  node.style('opacity', function (d) {
    if (d.isVisible) {
      return (d.isHighlighted) ? 1 : reducedOpacity;
    } else { return 0; }
  });

  // Edge Checking
  path.style('opacity', function (curPath) {
    let src = curPath.source;
    let targ = curPath.target;
    if (src.isVisible && targ.isVisible) {
      return (curPath.source.isHighlighted && curPath.target.isHighlighted) ? 1 : reducedOpacity;
    } else { return 0; }
  });
  checkOpacity();
}

// function collapseAll (rootId) {
//   // Set all nodes to be invisible
//   nodesToRender.forEach(function (item) {
//     item.isVisible = (item.id === projectRootId || item.id === rootId);
//   });
// }

/**
 * Check if all the nodes are un-highlighted. If they are, highlight all the nodes on the graph.
 */
function checkOpacity () {
  let highlight = false; // flag to see if anyone is highlighted.
  nodesToRender.forEach(function (d) {
    if (d.isVisible && d.isHighlighted) {
      highlight = true; // If ANY node is highlighted set this flag.
    }
  });
  if (highlight === false) {  // Only executes if ALL nodes are NOT highlighted.
    node.style('opacity', function (d) {
      return d.isVisible ? 1 : 0;
    });// Turn Everyone on
    path.style('opacity', function (d) {
      return (nodeToEdgeMap[d.source.id].node.isVisible && nodeToEdgeMap[d.target.id].node.isVisible) ? 1 : 0;
    }); // Turn on all the edges.
  }
}
