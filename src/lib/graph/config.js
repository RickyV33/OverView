import configNodes from './nodes';
import * as node from './nodes';
import configEdges from './edges';
import * as path from './edges';

export const PROJECT_AS_ROOT = -1;

let width = 1000;         // D3 window Width
let height = 800;         // D3 window height

let relationsChecked = false;   // Flag to see if relations check was run

let currentProjectId = PROJECT_AS_ROOT;
let currentRootId;
let nodesToRender = [];   // Gets passed into the D3 force nodes function
let edgesToRender = [];   // Gets passed into the D3 force links function
export let nodesEdgesMap = {};
export let projectNode = {};

let svg = null;
let force = null;         // The force layout for d3
let debug = true;         // To display the function console logs

/**
 * For every shift of the graph, this function gets called.
 * It updates the location of the nodes and edges.
 *
 * @param {Object} e
 */
function tick (e) {
  if (path.get()) {
    path.get().call(path.tick);
  }
  node.tick(e);
}

document.addEventListener('DOMContentLoaded', () => {
  svg = d3.select('#d3Container').append('svg');
  config();
});

function config() {
  svg.attr('id', 'graphSVG')
    .attr('width', '100%')
    .attr('height', height)
    .call(d3.behavior.zoom().scaleExtent([1, 10])
      .on('zoom', function () {
        svg.attr('transform', 'translate(' + d3.event.translate + ')' + ' scale(' + d3.event.scale + ')');
      }))
    .on('dblclick.zoom', null)  // To remove the double click zoom function
    .append('g'); // Add a group element within it to encompass all the nodes - this fixes the chrome

  // ============ build the arrows ================
  svg.append('svg:defs').selectAll('marker')
    .data(['end'])      // Different link/path types can be defined here
    .enter().append('svg:marker')    // This section adds in the arrows
    .attr('id', String)
    .attr('viewBox', '0 -5 10 10')
    .attr('refX', 18)
    .attr('refY', 0)
    .attr('markerWidth', 4)
    .attr('markerHeight', 4)
    .attr('orient', 'auto')
    .append('svg:path')
    .attr('d', 'M0,-5L10,0L0,5')
    .attr('class', 'arrow');

  force = d3.layout.force()
    .size([width, height])
    .linkDistance(100)  // sets the target distance between linked nodes to the specified value
    // negative charge results in node repulsion, while positive value results in node attraction
    .charge(d => {  // Variable Charge
      let chargeVal = -500;
      return d.downStream ? chargeVal + (-200 * d.downStream.length) : chargeVal - 200;
    })
    .linkStrength(d => {  // Variable link Strength
      let strengthVal = 1;
      return d.downStream ? strengthVal + (-0.12 * (d.source.downStream.length)) : strengthVal - 0.12;
    });

  configNodes(svg, force, false, true);
  configEdges(svg, force);
}

export function rootId (rootId) {
  if (rootId === undefined) {
    return currentRootId;
  } else {
    currentRootId = rootId;
  }
}

export function projectRootId() {
  return currentProjectId;
}

export function size() {
  return {
    width: width,
    height: height
  };
}

/**
 * Updates the graph visuals by setting the data and configuring the nodes and edges
 * @param {object} graphData
 * @param {integer} selectedProjectId
 * @param {integer} rootId is the id of the element that is to be the root node coming off the project node
 */
export default function update (graphData, selectedProjectId, rootId = parseInt(PROJECT_AS_ROOT)) {
  if (debug) {
    // console.log('Root ID: ' + rootId + '  CurrentRootId: ' + currentRootId);
    // console.log('Project ID: ' + selectedProjectId + '  CurrentProjectId: ' + currentProjectId);
  }

  if (currentProjectId !== selectedProjectId) {
    insertProjectNode(graphData, rootId);
    nodesEdgesMap = mapNodesToEdges(graphData);  // Pre-process data for faster data retrieval
    currentProjectId = selectedProjectId;
  }

  if (debug) {
    console.log(nodesEdgesMap[rootId]);
  }

  if (rootId !== currentRootId) {
    // clearGraph(); // Clear all of the graph data
    filterJSON(graphData, rootId); // Filters the JSON for only the downStream nodes from the selected item
    resetVisitedFlag(); // Sets all of the visited flags to false

    // updateGraph(graphData, rootId);  // Render the graph

    // Collapses all the nodes except the root node
    // NOTE - If you collapse all, then you need to set the isVisible = false and isCollapsed = true
    // default values in mapNodesToEdges()
    // collapseAll(rootId);

    // updateOpacity();
    currentRootId = rootId;
  }

  if (debug) {
    console.log('updateGraph()');
  }

  if (!relationsChecked) {
    // For each relationship, add the target to the source node
    graphData.relationships.forEach(function (relItem) {
      // Find node object based on the relationship source id
      let srcNode = nodesEdgesMap[relItem.source];
      let trgNode = nodesEdgesMap[relItem.target];

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

  node.data(nodesToRender);
  path.data(edgesToRender);
  force.tick(tick);
  force.start();

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
      filterJSONRecursive(nodesEdgesMap[rootId]);
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
          filterJSONRecursive(nodesEdgesMap[relItem.target]);  // Traverse down the relations
        });
      }
    }
  }
}

/**
 * Maps each node to a node object and all of its upstream and downStream relationships
 * NOTE - nodesEdgesMap is an array that uses id as the index for direct access
 * @param {object} graphData
 */
function mapNodesToEdges (graphData) {
  let nodesEdgesMap = {};

  graphData.items.forEach(function (item) {
    let thisItem = nodesEdgesMap[item.id] = {};
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

  return nodesEdgesMap;
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
 * Hides all of the graph nodes except the root id
 */
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
      return (nodesEdgesMap[d.source.id].node.isVisible && nodesEdgesMap[d.target.id].node.isVisible) ? 1 : 0;
    }); // Turn on all the edges.
  }
}
