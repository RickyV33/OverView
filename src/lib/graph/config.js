import * as nodes from './nodes';
import * as edges from './edges';

export const PROJECT_AS_ROOT = -1;

let width = 1000;         // D3 window Width
let height = 800;         // D3 window height

let currentProjectId = PROJECT_AS_ROOT;
let currentRootId;
let nodesToRender = [];   // Gets passed into the D3 force nodes function
let edgesToRender = [];   // Gets passed into the D3 force links function
export let nodesEdgesMap = {};
export let projectNode = {};

let svg = null;
let force = null;         // The force layout for d3
export let debug = true;         // To display the function console logs

/**
 * For every shift of the graph, this function gets called.
 * It updates the location of the nodes and edges.
 *
 * @param {Object} e
 */
function tick (e) {
  if (debug) {
    console.log('graph.tick()');
  }

  nodes.tick(e);
  edges.tick(e);
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
    .append('g').attr('id', 'nodes'); // Add a group element within it to encompass all the nodes - this fixes the chrome

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

  svg.append('svg:g').attr('id', 'edges');

  force = d3.layout.force()
    .size([width, height])
    .nodes([]).links([])
    .linkDistance(100)  // sets the target distance between linked nodes to the specified value
    // negative charge results in node repulsion, while positive value results in node attraction
    .charge(d => {  // Variable Charge
      let chargeVal = -500;
      return d.downstreamEdges ? chargeVal + (-200 * d.downstreamEdges.length) : chargeVal - 200;
    })
    .linkStrength(d => {  // Variable link Strength
      let strengthVal = 1;
      let sourceNode = getById(nodesEdgesMap.nodes, d.sourceId);
      return d.downstreamEdges ? strengthVal + (-0.12 * (sourceNode.downstreamEdges.length)) : strengthVal - 0.12;
    });

  force.tick(tick);
  force.start();
}

export function rootId (rootId) {
  if (rootId === undefined) {
    return currentRootId;
  } else {
    currentRootId = rootId;
  }
}

export function isRoot(node) {
  return node.id === currentRootId || node.id === currentProjectId;
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
    let projectName = graphData.name;
    nodesEdgesMap = mapNodesToEdges(graphData);  // Pre-process data for faster data retrieval
    insertProjectNode(nodesEdgesMap, projectName, rootId);
    nodes.setEdges(nodesEdgesMap.edges);
    currentProjectId = selectedProjectId;
  }

  if (debug) {
    console.log('root node:');
    console.log(getById(nodesEdgesMap.nodes, rootId));
  }

  if (rootId !== currentRootId) {
    // clearGraph(); // Clear all of the graph data
    filterJSON(nodesEdgesMap, rootId); // Filters the JSON for only the downStream nodes from the selected item
    nodes.resetVisitedFlag(); // Sets all of the visited flags to false

    // updateGraph(graphData, rootId);  // Render the graph

    // Collapses all the nodes except the root node
    // NOTE - If you collapse all, then you need to set the isVisible = false and isCollapsed = true
    // default values in mapNodesToEdges()
    // collapseAll(rootId);

    // updateOpacity();
    currentRootId = rootId;
  }

  if (debug) {
    console.log('graph.update()');
  }

  if (debug) {
    console.log(nodesEdgesMap.nodes);
    console.log(nodesEdgesMap.edges);
  }

  nodes.update(svg.select('#nodes'), force, nodesEdgesMap.nodes, false, true);
  edges.update(svg.select('#edges'), force, nodesEdgesMap.edges);

  force.start();

  /**
   * Filters the graph input to be filtered by the rootId and all its downStream nodes
   * @param {number} rootId
   * @param {object} nodesEdgesMap
   */
  function filterJSON (nodesEdgesMap, rootId) {
    if (debug) {
      console.log('Filter JSON: rootid = ' + rootId);
    }

    if (rootId && rootId !== currentProjectId) {
      console.log('node where id = ' + rootId + ': ' + getById(nodesEdgesMap.nodes, rootId));
      filterJSONRecursive(getById(nodesEdgesMap.nodes, rootId));
    } else {
      nodesToRender = nodesEdgesMap.nodes;
      edgesToRender = nodesEdgesMap.edges;
    }
  }

  /**
   * Filter Recursion function to traverse through the downstream elements of the selected root node
   * @param thisNode
   */
  function filterJSONRecursive (thisNode) {
    if (!thisNode.visited || thisNode.visited === 'undefined') {
      thisNode.visited = true;
      nodesToRender.push(thisNode);

      if (thisNode.edges.length > 0) {
        thisNode.edges.forEach(function (edgeIndex) {
          let edge = nodesEdgesMap.edges[edgeIndex];
          let targetNode = nodesEdgesMap.nodes[edge.target];
          edgesToRender.push(edge);
          filterJSONRecursive(targetNode);  // Traverse down the relations
        });
      }
    }
  }
}

function copyObject(object) {
  let copy = {};

  Object.keys(object).forEach(property => {
    copy[property] = object[property];
  });

  return copy;
}

function getDownstreamEdges (edges, node) {
  return edges.filter(edge => edge.sourceId === node.id);
}

function getUpstreamEdges (edges, node) {
  return edges.filter(edge => edge.targetId === node.id);
}

export function getById (object, id) {
  return object.filter(object => object.id === id)[0];
}

/**
 * Maps each node to a node object and all of its upstream and downStream relationships
 * NOTE - nodesEdgesMap is an array that uses id as the index for direct access
 * @param {object} graphData
 */
function mapNodesToEdges (graphData) {
  let edges = graphData.relationships.map(copyObject);

  edges = edges.map(edge => {
    edge.sourceId = edge.source;
    edge.targetId = edge.target;

    return edge;
  });

  let nodes = graphData.items.map(item => {
    let node = copyObject(item);

    node.isCollapsed = false;
    node.isVisible = true;
    node.isHighlighted = false;
    node.visited = false;

    let downstreamEdges = getDownstreamEdges(edges, node).map(edge => {
      return edges.indexOf(edge);
    });
    let upstreamEdges = getUpstreamEdges(edges, node).map(edge => {
      return edges.indexOf(edge);
    });

    node.downstreamEdges = node.edges = downstreamEdges;
    node.upstreamEdges = upstreamEdges;

    node.noRelations = (node.downstreamEdges.length === 0);

    return node;
  });

  edges = edges.map(edge => {
    edge.source = nodes.indexOf(getById(nodes, edge.sourceId));
    edge.target = nodes.indexOf(getById(nodes, edge.targetId));

    return edge;
  });

  return {
    edges: edges,
    nodes: nodes
  };
}

/**
 * Adds a project node to the graph
 * @param graphData
 * @param name
 * @param rootId
 */
function insertProjectNode (graphData, name, rootId) {
  // Create a project node and add it to the nodes list
  projectNode = {id: currentProjectId, name: name, image: '', type: -1};

  projectNode.isCollapsed = false;
  projectNode.isVisible = true;
  projectNode.isHighlighted = false;
  projectNode.visited = false;

  let downstreamEdges = getDownstreamEdges(graphData.edges, projectNode).map(edge => {
    return edges.indexOf(edge);
  });
  let upstreamEdges = getUpstreamEdges(graphData.edges, projectNode).map(edge => {
    return edges.indexOf(edge);
  });

  projectNode.downstreamEdges = projectNode.edges = downstreamEdges;
  projectNode.upstreamEdges = upstreamEdges;

  projectNode.noRelations = (projectNode.downstreamEdges.length === 0);

  graphData.nodes.unshift(projectNode);

  // Add a relationship from project node to root id if one was passed in
  if (debug) {
    console.log('insertProjectNode() ===> rootID=' + rootId);
  }

  if (rootId && rootId !== currentProjectId) {
    graphData.edges.push({
      id: currentProjectId,
      sourceId: currentProjectId,
      targetId: rootId,
      source: graphData.nodes.indexOf(getById(graphData.nodes, currentProjectId)),
      target: graphData.nodes.indexOf(getById(graphData.nodes, rootId)),
      type: -1
    });
  }
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
