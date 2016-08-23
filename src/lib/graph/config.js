/* global d3*/
/* exported insertProjectNode */
import * as nodes from './nodes';
import * as edges from './edges';
import configureInfoTip from './infoTip';
import { physics, itemNames, float } from '../displayProjectsGraph';

export const PROJECT_AS_ROOT = -1;

let width = 1000;         // D3 window Width
let height = 800;         // D3 window height
export let reducedOpacity = 0.2; // highlight opacity to reduce to

let currentProjectId = PROJECT_AS_ROOT;
let currentRootId = -1;

export let nodesToRender = [];   // Gets passed into the D3 force nodes function
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
  if (debug === 2) {
    console.log('graph.tick()');
  }

  nodes.tick(e);
  edges.tick(e);

  // Toggle the float direction
  switch (float) {
    case 0:
      edges.floatEdgesRight(e);
      break;
    case 1:
      edges.floatEdgesDown(e);
      break;
    case 2:
      break;
  }
}

document.addEventListener('DOMContentLoaded', () => {
  svg = d3.select('#d3Container').append('svg');
  config();
  configureInfoTip();
});

function config () {
  svg.attr('id', 'graphSVG')
    .attr('width', '100%')
    .attr('height', height)
    .call(d3.behavior.zoom().scaleExtent([1, 10])
      .on('zoom', function () {
        svg.select('g').attr('transform', 'translate(' + d3.event.translate + ')' + ' scale(' + d3.event.scale + ')');
      }))
    .on('dblclick.zoom', null);  // To remove the double click zoom function

  let mainGroup = svg.append('g');
  mainGroup.append('g').attr('id', 'edges');
  mainGroup.append('g').attr('id', 'nodes');

  // ============ build the arrows ================
  let arrowData = [
    { id: 'arr', name: 'arrow', path: 'M0,-5L10,0L0,5', viewbox: '0 -5 10 10', class: 'arrow' },
    { id: 'arr-sus', name: 'arrow-suspect', path: 'M0,-5L10,0L0,5', viewbox: '0 -5 10 10', class: 'arrow-suspect' }
  ];

  svg.append('svg:defs').selectAll('marker')
    .data(arrowData)
    .enter().append('svg:marker')
    .attr('id', function (d) { return 'marker-' + d.name; })
    .attr('viewBox', function (d) { return d.viewbox; })
    .attr('refX', 28)
    .attr('refY', 0)
    .attr('markerWidth', 4)
    .attr('markerHeight', 4)
    .attr('orient', 'auto')
    .append('svg:path')
    .attr('d', function (d) { return d.path; })
    .attr('class', function (d) { return d.class; });

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

  force.start();
}

export function rootId (rootId) {
  if (rootId === undefined || isNaN(rootId)) {
    return currentRootId;
  } else {
    currentRootId = rootId;
  }
}

export function isRoot (node) {
  return node.id === currentRootId || node.id === currentProjectId;
}

export function projectRootId () {
  return currentProjectId;
}

export function size () {
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
    console.log('Root ID: ' + rootId + ' <==>  CurrentRootId: ' + currentRootId);
    console.log('Project ID: ' + selectedProjectId + ' <==>  CurrentProjectId: ' + currentProjectId);
  }

  if (currentProjectId !== selectedProjectId) {
    // Clears out the html tags within the SVG
    svg.select('#nodes').selectAll('.node').remove();
    svg.select('#edges').selectAll('.link').remove();

    // Clears out the data for the graph
    nodesToRender = [];
    edgesToRender = [];

    // insertProjectNode(graphData, rootId);  // This function has to occur right before mapping occurs
    nodesEdgesMap = mapNodesToEdges(graphData);  // Pre-process data for faster data retrieval
    nodes.setEdges(nodesEdgesMap.edges);

    filterJSON(nodesEdgesMap, rootId);
  } else {
    // Clears out the html tags within the SVG
    svg.select('#nodes').selectAll('.node').remove();
    svg.select('#edges').selectAll('.link').remove();

    // Clears out the data for the graph
    nodesToRender = [];
    edgesToRender = [];

    filterJSON(nodesEdgesMap, rootId);
  }
  console.log('DONE FILTERING');
  // console.log(nodesToRender);
  // Collapses all the nodes except the root node
  // NOTE - If you collapse all, then you need to set the isVisible = false and isCollapsed = true
  // default values in mapNodesToEdges()
  // collapseAll(rootId);
  // updateOpacity();

  resetVisitedFlag(); // Sets all of the visited flags to false
  console.log('RESET HAPPENED');
  // console.log(nodesToRender);
  currentProjectId = selectedProjectId;
  currentRootId = rootId;

  if (debug) {
    console.log('root node:');
    console.log(getById(nodesEdgesMap.nodes, rootId));

    console.log('===> graph.update()');
    console.log('nodesToRender');
    console.log(nodesToRender);
    console.log('edgesToRender');
    console.log(edgesToRender);
  }
  if (debug === 2) {
    console.log(nodesEdgesMap.nodes);
    console.log(nodesEdgesMap.edges);
  }

  // Set the force data
  force.links(edgesToRender);
  force.nodes(nodesToRender);

  // Call the node and edge update sections to build them
  edges.update(svg, force, edgesToRender);
  nodes.update(svg, force, nodesToRender, physics, itemNames);

  force.on('tick', tick);
  force.start();
  updateOpacity();
}

/**
 * Filters the graph input to be filtered by the rootId and all its downStream nodes
 * @param {number} rootId
 * @param {object} nodesEdgesMap
 */
function filterJSON (nodesEdgesMap, rootId) {
  if (debug) {
    console.log('===> Filter JSON: rootid = ' + rootId);
  }

  if (rootId && !isNaN(rootId) && rootId !== currentProjectId) {
    let rootNode = getById(nodesEdgesMap.nodes, rootId);

    if (debug) {
      console.log('\t\tFilter by node id = ' + rootId);
      console.log(rootNode);
    }

    filterJSONRecursive(rootNode);
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
  if (debug) {
    console.log('\t===> filterJSONRecursive()');
  }

  if (!thisNode.visited || thisNode.visited === 'undefined') {
    thisNode.visited = true;
    nodesToRender.push(thisNode);

    if (thisNode.edges.length > 0) {
      thisNode.edges.forEach(function (edgeIndex) {
        let foundEdge = nodesEdgesMap.edges[edgeIndex];
        let targetNode = foundEdge.target;
        edgesToRender.push(foundEdge);
        filterJSONRecursive(targetNode);  // Traverse down the relations
      });
    }
  }
}

/**
 * Does a deep copy of a given object
 * @param object
 * @returns {{}}
 */
function copyObject (object) {
  let copy = {};

  Object.keys(object).forEach(property => {
    copy[property] = object[property];
  });

  return copy;
}

/**
 * Gets the downstream edges of the given node
 * @param edges
 * @param node
 * @returns {Array|*|Array.<T>}
 */
function getDownstreamEdges (edges, node) {
  return edges.filter(edge => edge.sourceId === node.id);
}

/**
 * Gets the upstream edges of a given node
 * @param edges
 * @param node
 * @returns {Array|*|Array.<T>}
 */
function getUpstreamEdges (edges, node) {
  return edges.filter(edge => edge.targetId === node.id);
}

/**
 * Gets the object data from the map
 * @param object
 * @param id
 * @returns {*|T}
 */
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

    node.isCollapsed = false;    // Collapse feature flag
    node.isVisible = true;       // visibility feature flag
    node.isHighlighted = false;  // Highlight feature flag
    node.visited = false;        // For traversing through the graph
    node.isSuspect = false;      // For helping to mark the node as suspect

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

  // Set the source and target as objects instead of ids
  edges = edges.map(edge => {
    edge.source = getById(nodes, edge.sourceId);
    edge.target = getById(nodes, edge.targetId);

    return edge;
  });

  return {
    edges: edges,
    nodes: nodes
  };
}

/**
 * Adds a project node to the graph data
 * @param graphData
 * @param name
 * @param rootId
 */
export function insertProjectNode (graphData, rootId) {
  if (debug) {
    console.log('===> insertProjectNode()');
    console.log('\trootID=' + rootId);
  }
  // Create a project node and add it to the nodes list
  projectNode = {id: currentProjectId, name: graphData.name, image: '', type: -1};

  graphData.items.unshift(projectNode);

  // Add a relationship from project node to root id if one was passed in
  if (debug) {
    console.log('\t... Checking on root id');
  }

  // If there is a root node selected, then add an edge between project node and root node
  if (rootId && rootId !== currentProjectId) {
    graphData.relationships.push({id: currentProjectId, source: currentProjectId, target: rootId, type: -1});
  }
}

/**
 * Hides all of the graph nodes except the root id
 */
export function collapseAll (rootId) {
  // Set all nodes to be invisible
  nodesToRender.forEach(function (item) {
    item.isVisible = (item.id === projectRootId || item.id === rootId);
  });
}

/**
 * Check if all the nodes are un-highlighted. If they are, highlight all the nodes on the graph.
 */
export function checkOpacity () {
  let highlight = false; // flag to see if anyone is highlighted.
  d3.selectAll('.node').data().forEach((d) => {
    if (d.isVisible && d.isHighlighted) {
      highlight = true; // If ANY node is highlighted set this flag.
    }
  });
  if (highlight === false) {  // Only executes if ALL nodes are NOT highlighted.
    d3.selectAll('.node').style('opacity', (d) => {
      return d.isVisible ? 1 : 0;
    });// Turn Everyone on
    d3.selectAll('.link').style('opacity', (d) => {
      if (d.source && d.target) {
        return (d.source.isVisible && d.target.isVisible) ? 1 : 0;
      }
    }); // Turn on all the edges.
  }
}

/**
 * Updates the opacity of all the nodes and edges based on their current flags.  * If the current node is hightlighted,
 * then show it, otherwise reduce the opacity. Check every edge's source and target nodes. If they are both visible,
 * then check if they are highlighted. If they are not highlighted, then reduce the opacity.
 */
export function updateOpacity () {
  if (debug) {
    console.log('edges updateOpacity()');
  }

  // Updates the opacity of the nodes
  d3.selectAll('.node').style('opacity', d => {
    if (d.isVisible) {
      return d.isHighlighted ? 1 : reducedOpacity;
    } else {
      return 0;
    }
  });

  // Updates the opacity of each edge
  d3.selectAll('.link').style('opacity', p => {
    let src = p.source;
    let targ = p.target;
    if (src.isVisible && targ.isVisible) {
      return (src.isHighlighted && targ.isHighlighted) ? 1 : reducedOpacity;
    } else { return 0; }
  });

  checkOpacity(); // Check every nodes opacity
  downstreamBadgeToggle(); // Check the downstream count badge
}

/**
 * Go through every node with downstream elements and check to see if it is visible.
 * If one of its downstream items is not visible, then show the node count badge, otherwise hide it.
 */
function downstreamBadgeToggle () {
  if (debug) {
    console.log('downstreamBadgeToggle()');
  }

  d3.selectAll('.hasDownstream > .downstreamCount').classed('hidden', item => {
    let hasHiddenDownstream = false;
    item.edges.forEach(function (d) {
      let foundEdge = nodesEdgesMap.edges[d];
      let targetNode = foundEdge.target;
      if (!targetNode.isVisible) { hasHiddenDownstream = true; }
    });

    return !hasHiddenDownstream;
  });
}

/**
 * Cycle through all of the nodes and edges and set the visited flag to false
 */
export function resetVisitedFlag () {
  if (debug) {
    console.log('resetVisitedFlag()');
  }
  nodesToRender.forEach((node) => {
    node.visited = false;
  });
}
