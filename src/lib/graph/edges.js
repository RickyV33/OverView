import { debug } from './config';

let path = null;

let curves = false;

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
  if (d.source && d.target)
  {
    return 'M' + d.source.x + ',' + d.source.y +
      'S' + d.source.x + ',' + d.source.y +
      ' ' + d.target.x + ',' + d.target.y;
  }
}

/**
 * Float the nodes to the bottom of their upstream node
 */
function floatEdgesDown (e) {
  var offset = 10 * e.alpha; // For the node offset

  path.each(function (d) {
    d.source.y -= offset;  // Offset sources up
    d.target.y += offset;  // Offset targets down
  }).attr('x1', function (d) { return d.source.x; })
    .attr('y1', function (d) { return d.source.y; })
    .attr('x2', function (d) { return d.target.x; })
    .attr('y2', function (d) { return d.target.y; });
}

/**
 * Updates the opacity of all the nodes and edges based on their current flags.
 */
function updateOpacity () {
  if (debug) {
    console.log('edges updateOpacity()');
  }

  path.style('opacity', function (curPath) {
    let src = curPath.source;
    let targ = curPath.target;
    if (src.isVisible && targ.isVisible) {
      return (curPath.source.isHighlighted && curPath.target.isHighlighted) ? 1 : reducedOpacity;
    } else { return 0; }
  });
  checkOpacity();
}

export function update (svg, forceLayout, edges) {
  if (debug) {
    console.log('edges.update()');
  }

  forceLayout.links(edges);

  let path = svg.selectAll('.link').data(forceLayout.links())
    .enter().append('svg:path')
    .attr('id', d => d.id)
    .attr('class', thisPath => {
      let result = 'link';
      result = (thisPath.suspect) ? result + ' suspect' : result;  // Check the type and add a style according to type

      return result;
    })
    .attr('marker-end', 'url(#end)');

  path.append('svg:title')  // Added a string to edge hover
    .text(d => {
      let strTitle = d.id + ' ==> ' + d.type;
      if (d.suspect) {
        strTitle = strTitle + ' - Suspect';
      }
      return strTitle;
    });
}

export function tick (e) {
  if (debug) {
    console.log('edges.tick()');
  }

  d3.selectAll('.link').call(d => {
    if (curves) {
      return curvedEdges(d);
    } else {
      return straightEdges(d);
    }
  });
}
