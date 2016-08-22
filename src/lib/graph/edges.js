/* global d3*/
import { debug } from './config';
import { curves } from '../displayProjectsGraph';
import * as nodeInfoTip from './infoTip';

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
 * Float the edges to the bottom of their upstream node
 */
export function floatEdgesDown (e) {
  var offset = 10 * e.alpha; // For the node offset

  d3.selectAll('.link').each((d) => {
    d.source.y -= offset;  // Offset sources up
    d.target.y += offset;  // Offset targets down
  }).attr('x1', (d) => { return d.source.x; })
    .attr('y1', (d) => { return d.source.y; })
    .attr('x2', (d) => { return d.target.x; })
    .attr('y2', (d) => { return d.target.y; });
}

/**
 * Update the force links in the graph by building them.
 * It also contains the exit event definition
 * @param svg
 * @param forceLayout
 * @param edges
 */
export function update (svg, forceLayout, edges) {
  if (debug) {
    console.log('edges.update()');
  }

  let paths = svg.select('#edges').selectAll('.link')
    .data(forceLayout.links());

  paths.enter()
    .append('svg:path')
      .attr('id', d => d.id)
      .attr('class', thisPath => {
        let result = 'link';
        result = (thisPath.suspect) ? result + ' suspect' : result;  // Check the type and add a style according to type
        return result;
      })
      .attr('marker-end', (d) => {
        return d.suspect ? 'url(#marker-arrow-suspect)' : 'url(#marker-arrow)';
      })
      .on('mouseover', edgeMouseOver)
      .on('mouseout', edgeMouseOut);

  // Removal transitions go here
  paths.exit().remove(); // Remove unneeded elements
}

export function tick (e) {
  if (debug === 2) {
    console.log('edges.tick()');
  }

  d3.selectAll('.link').attr('d', d => {
    if (curves) {
      return curvedEdges(d);
    } else {
      return straightEdges(d);
    }
  });
}

/**
 * Mouse over event for edge object that displays a tooltip
 * @param overEdge
 */
function edgeMouseOver (overEdge) {
  if (debug) {
    console.log('edgeMouseOver()');
  }

  d3.select(this).classed('hoverOverEdge', true);

  let strTarget = overEdge.target.name;
  let strSource = overEdge.source.name;
  let strSuspect = overEdge.suspect ? 'Suspect' : '';
  let strTitle = overEdge.suspect ? '<h5 class="critical">' + strSuspect + '</h5>' : '';
  let strRelType = '<h5>' + overEdge.relationshipType + '</h5>';
  let tipText = strTitle + strRelType + '<div class="content">' + strSource + '<br>---><br>' + strTarget + '</div>';

  // Set the tip html and position
  d3.select('#nodeInfoTip').html(tipText)
    .style('left', (d3.event.pageX) + 'px')
    .style('top', (d3.event.pageY + 30) + 'px')
    .style('visibility', 'visible');

  nodeInfoTip.update(tipText); // Set the tip html and position
}

/**
 * Mouse out event for edge object that hides a tooltip and changes edge back to original size
 * It also resets the html in the node info tip div
 */
function edgeMouseOut () {
  if (debug) {
    console.log('edgeMouseOut()');
  }

  d3.select(this).classed('hoverOverEdge', false); // Unset the hover over css class
  nodeInfoTip.hide();
}
