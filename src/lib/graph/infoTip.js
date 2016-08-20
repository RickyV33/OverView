/* global d3*/
let infoTip = null;

export default function config () {
  infoTip = d3.select('body').append('div')
    .attr('class', 'nodeInfoTip').text('');
}

export function hide () {
  infoTip.html('').style('visibility', 'hidden');
}

export function update (text) {
  infoTip.html(text)
    .style('left', (d3.event.pageX) + 'px')
    .style('top', (d3.event.pageY + 30) + 'px')
    .style('visibility', 'visible');
}
