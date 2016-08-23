/* global d3*/
/* exported nodesEdgesMap */
import { isRoot, size, getById, projectNode, debug, updateOpacity, nodesEdgesMap, nodesToRender } from './config';
import * as nodeInfoTip from './infoTip';

let edges = null;
let timer;                // For click event monitoring
let clickedOnce = false;  // For monitoring the click event on node

/**
 * Highlight the selected node "d" then highlight the downstreamEdges' target nodes
 * @param {object} d
 */
function highlightNodes (d) {
  // Highlight the selected node
  d.isHighlighted = true;
  // if it has downstream nodes find them and highlight them
  if (d.downstreamEdges.length > 0) {
    d.downstreamEdges.forEach((edgeIndex) => {
      edges[edgeIndex].target.isHighlighted = true;
    });
  }
}

/**
 * Un-highlight the clicked node (d) and the array of downStream nodes for it. This will NOT
 * un-highlight a node if all of it's children are highlighted
 * @param {object} d is the node that was just clicked
 */
// TODO : Keep nodes with two highlighted upstream nodes highlighted on un-highlight with a count
function unHighlightNodes (d) {
  if (debug) {
    console.log('====> unHighlightNodes()');
  }

  // unhighlight the selected node
  d.isHighlighted = false;
  // set the selected node to visited
  d.visited = true;
  let count = -1; // used to check if the downstream nodes should be un-highlighted.
  if (d.downstreamEdges.length > 0) {
    d.downstreamEdges.forEach((edgeIndex) => {
      let curNode = edges[edgeIndex].target;
      curNode.visited = true;
      // If a node exists and it has downstream items, we need to see if they are all highlighted.
      if (typeof curNode.downstreamEdges !== 'undefined' && curNode.downstreamEdges.length > 0) {
        count = downStreamHighlightCheck(curNode, count); // check downStream nodes for highlighting
      }
      if (count !== curNode.downstreamEdges.length) { // If all the downstream nodes were not highlighted, we can unhighlight this node
        curNode.isHighlighted = false;
      } else {
        curNode.downstreamEdges.forEach((edgeIndex) => {
          edges[edgeIndex].target.isHighlighted = true;
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
  if (d.downstreamEdges.length > 0) {
    d.downstreamEdges.forEach((edgeIndex) => {
      let curNode = edges[edgeIndex].target;
      // The 'visited' flag is true when a node that WAS highlighted had been flipped to being UnHighlighted.
      if ((curNode.downstreamEdges && curNode.isHighlighted) || curNode.visited) {
        count = (count === -1) ? 1 : count + 1;
      }
      curNode.visited = true;
    });

    if (debug) {
      console.log('count is: ' + count);
      console.log('downstream length is: ' + d.downstreamEdges.length);
    }

    return count;
  }
}

/**
 * Collapses all of the graph nodes downStream from the selected node
 * @param {number} id is the object that is selected and whose downStream nodes will be toggled
 */
function collapse (id) {
  if (debug) {
    console.log('-- collapse *' + id);
  }

  let nodes = d3.selectAll('.node').data();
  let thisNode = getById(nodes, id);

  if (!thisNode.visited || thisNode.visited === 'undefined') {
    thisNode.visited = true;

    if (!thisNode.isCollapsed) {
      if (thisNode.edges.length > 0) {
        // Hide each downStream edge and recurse to downStream node
        thisNode.edges.forEach((edgeIndex) => {
          let edge = edges[edgeIndex];
          let targetNode = edge.target;

          targetNode.isVisible = false;

          // if (!targetNode.visited) {
          //   targetNode.isCollapsed = true;
          //   targetNode.visited = true; // Toggle the visited flag
          // }

          collapse(edge.targetId);  // Collapse downstream nodes
        });
      }
    }
    thisNode.isCollapsed = true;
    thisNode.isVisible = false;
  }
}

/**
 * Uncollapses a node and all it's downstream items at the given id.
 * @param id
 */
function unCollapse (id) {
  if (debug) {
    console.log('-- unCollapse() --');
  }

  let nodes = d3.selectAll('.node').data();
  let thisNode = getById(nodes, id);

  if (thisNode.edges.length > 0) {
    // Hide each downStream edge and recurse to downStream node
    thisNode.edges.forEach((edgeIndex) => {
      edges[edgeIndex].target.isVisible = true;
      // edges[edgeIndex].target.isCollapsed = false;
    });
    thisNode.isCollapsed = false;
  }
  thisNode.isVisible = true;
}

/**
 * Mouse over event for node object that displays a tooltip and changes node circle size to a larger radius
 * @param overNode
 */
function nodeMouseOver (overNode) {
  // Make the node circle larger and change opacity
  d3.select(this).select('circle').transition()
    .duration(500)
    .attr('r', 17)
    .attr('opacity', 1);

  let idVal = (overNode.id >= 0) ? overNode.id + ' - ' : '';
  let imageVal = overNode.image ? '<img src="' + overNode.image + '">' : '';
  let nodeText = '<h5>' + imageVal + idVal + overNode.name + '</h5>';

  if (overNode.description) {
    let stringDescription = overNode.description.length > 100 ? overNode.description.substring(0, 100) + '...' : overNode.description;
    nodeText = nodeText + '<div class="content">' + stringDescription + '</div>';
  }

  nodeInfoTip.update(nodeText); // Set the tip html and position
}

/**
 * Mouse out event for node object that hides a tooltip and changes node circle back to original size.
 * It also removes the hover over class.
 */
function nodeMouseOut () {
  d3.select(this).select('circle').transition()
    .duration(500)
    .attr('r', 13)
    .attr('opacity', 0.9);

  // Remove the hover over class
  d3.select(this).classed('hoverOver', false);
  nodeInfoTip.hide();
}

//
// ============ Toggle highlighting nodes on single click ===========
//

/**
 * This click event is being called upon node click
 * It checks to see if the user did a double click and sets a click timeout for the double click
 * @param d
 */
function click (d) {
  if (clickedOnce) {  // This only occurs if someone clicks twice before the timeout below
    nodeDoubleClick(d);  // Call the double click function
  } else {              // We've seen a single click
    // Changes the clicked node to active color
    d3.selectAll('.activeNode').classed('activeNode', false);
    d3.select(this).classed('activeNode', true);

    if (d3.event.shiftKey) {  // If we see a click with a shift...
      nodeClick(d);  // Call nodeClick() to check (un)highlighting
    } else {
      timer = setTimeout(() => { // If we just see a click check for double click
        clickedOnce = false;  // We timed out after 175ms so we are NOT seeing a double click
      }, 175);
      clickedOnce = true; // We set clickedOnce to true, if we see another click before timeout, it's a double
    }
  }
}

/**
 * Handles the logic for highlighting and un-highlighting nodes on single-click
 * @param {Object} selectedNode is the node that was just clicked
 */
function nodeClick (d) {
  if (debug) {
    console.log('===============> nodeClick');
  }

  let highlightedCount = 0; // this will count how many downStream nodes are highlighted.
  if (d.downstreamEdges.length > 0) {
    d.downstreamEdges.forEach((edgeIndex) => {
      let targetNode = edges[edgeIndex].target;
      if (targetNode.isHighlighted) {
        highlightedCount++;
      }
    });
  }

  // highlightedCount = downStreamHighlightCheck(d, highlightedCount);
  if (d.isHighlighted) {
    // If the downstream items are not all highlighted, then we highlight all of them
    // Otherwise unHighlight all of them
    if (d.downstreamEdges.length > 0 && (highlightedCount !== d.downstreamEdges.length)) {
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
 * Cycle through all of the nodes and edges and set the visited flag to false
 */
export function resetVisitedFlag () {
  if (debug) {
    console.log('resetVisitedFlag()');
  }
  nodesToRender.forEach ( (node) => {
    node.visited = false;
  });
}

/**
 * Node double click event hides all of the children nodes for double clicked node.
 *
 * @param {Object} clickedNode is the node that was clicked on
 */
function nodeDoubleClick (clickedNode) {
  if (debug) {
    console.log('======> Double Click Fired on ' + clickedNode.id);
    console.log('NODE CLICKED:  ');
    console.log(getById(nodesEdgesMap.nodes ,clickedNode.id));
    // console.log(clickedNode);
  }

  clickedOnce = false;  // For resetting the clickedOnce flag
  clearTimeout(timer);  // Reset the timer for click event
  console.log(getById(nodesEdgesMap.nodes ,clickedNode.id).downstreamEdges.length);
  console.log(getById(nodesEdgesMap.nodes ,clickedNode.id).isCollapsed);
  if (clickedNode.isCollapsed) {
    if (clickedNode.downstreamEdges.length > 0) {
      unCollapse(clickedNode.id);
    }
  } else {
    if (clickedNode.downstreamEdges.length > 0) {
      clickedNode.downstreamEdges.forEach((edgeIndex) => {
        collapse(edges[edgeIndex].targetId);
      });
      clickedNode.isCollapsed = true;
    }
  }
  resetVisitedFlag();
  updateOpacity();
}

export function setEdges (edgesToSet) {
  edges = edgesToSet;
}

/**
 * Update definition of the node. Includes what to append when new data is added and what to do on exit.
 * @param svg
 * @param forceLayout
 * @param nodes
 * @param physics
 * @param itemNames
 */
export function update (svg, forceLayout, nodes, physics, itemNames) {
  if (debug) {
    console.log('===> nodes.update()');
  }
  // select all the node class items (.node) under the node id (#node) and set the data to the nodes in forceLayout.nodes
  let node = svg.select('#nodes').selectAll('.node')
    .data(forceLayout.nodes());

  // when new nodes appear we need to build their attributes
  let nodeEnter = node.enter().append('g')
    .attr('id', (d) => {
      return 'node-' + d.id;  // Add an id element to each node
    })
    .attr('class', (thisNode) => {
      // Add projectRoot class if the node is the project node
      let strClass = 'node';

      if (isRoot(thisNode)) {
        strClass = strClass + ' projectRoot';
      }

      if (thisNode.downstreamEdges.length > 0) {
        strClass = strClass + ' hasDownstream';
      }
      return strClass;
    })
    .on('mouseover', nodeMouseOver)
    .on('mouseout', nodeMouseOut)
    .on('click', click);

  nodeEnter.append('circle') // Circle at node behind icon configuration
    .attr('x', '-14px')
    .attr('y', '-14px')
    .attr('r', 13);

  nodeEnter.append('image') // Image in the node circle configuration
    .attr('xlink:href', (n) => {
      return n.image;
    })
    .attr('x', '-9px')
    .attr('y', '-9px');

  if (itemNames === 2) {
    nodeEnter.append('text') // Add the name of the node as text
      .attr('class', 'nodeText')
      .attr('x', (d) => {
        return d.downstreamEdges.length > 0 ? 0 : 20; // Move text to right if the node has downstream items
      })
      .attr('dy', (d) => {
        return d.downstreamEdges.length > 0 ? 30 : 0; // Move text down if the node has downstream items
      })
      .attr('text-anchor', (d) => {
        return d.downstreamEdges.length > 0 ? 'middle' : 'right';
      })
      .text((d) => { // Limit the length of the name text
        return d.name.length > 18 ? d.name.substring(0, 15) + '...' : d.name;
      });
  } else if (itemNames === 1) {
    nodeEnter.append('text') // Add the name of the node as text
      .attr('x', 0)
      .attr('dy', 30)
      .attr('class', 'nodeText')
      .attr('text-anchor', 'middle')
      .text((d) => { // Limit the length of the name text
        return d.name.length > 18 ? d.name.substring(0, 15) + '...' : d.name;
      });
  } else if (itemNames === 0) {
    nodeEnter.append('text') // Add the name of the node as text
      .attr('x', 20)
      .attr('dy', 0)
      .attr('class', 'nodeText')
      .attr('text-anchor', 'right')
      .text((d) => { // Limit the length of the name text
        return d.name.length > 18 ? d.name.substring(0, 15) + '...' : d.name;
      });
  }

  node.exit().remove();  // Handles the removal of the nodes upon data change in d3 graph

  // Activate the physics if the physics flag is set
  if (physics) {
    nodeEnter.call(forceLayout.drag);
  }

  projectNode.fixed = true;  // Set the project Node to be fixed and not moving
  projectNode.x = size().height / 2;
  projectNode.y = size().width / 2;

  // Add a downstream item count circle to each node that has downstream items
  let downStreamNodes = svg.selectAll('.node.hasDownstream')
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
    .text((d) => {
      return d.downstreamEdges.length;
    });
}

export function tick (e) {
  if (debug === 2) {
    console.log('nodes.tick()');
  }

  let node = d3.selectAll('.node');

  // Move the edge depending on node location
  node.attr('transform', (d) => {
    return 'translate(' + d.x + ',' + d.y + ')';
  });
}
