let express = require('express');
let fs = require('fs');
let d3 = require('d3');
let jsdom = require('jsdom');
let router = express.Router();

/* let svg1 = d3.select('body').append('svg')
  .attr('height', 500)
  .attr('width', 500);

var chartWidth = 500, chartHeight = 500;
var arc = d3.arc()
  .outerRadius(chartWidth/2 - 10)
  .innerRadius(0);

var colours = ['#F00','#000','#000','#000','#000','#000','#000','#000','#000'];
*/
/* GET Project */
router.get('/:projectId', function (req, res) {
  res.render('project', {
    title: 'Jama Software Capstone',
    subtitle: 'Project',
    projectId: req.param('projectId')
  });

  // renderSVG();
});

/* function renderSVG( pieData, outputLocation ){
  if(!pieData) pieData = [12,31];
  if(!outputLocation) outputLocation = 'test.svg';

  jsdom.env({
    html:'',
    features:{ QuerySelector:true }, //you need query selector for D3 to work
    done:function(errors, window){
      window.d3 = d3.select(window.document); //get d3 into the dom

      //do your normal d3 stuff
      var svg = window.d3.select('body')
        .append('div').attr('class','container') //make a container div to ease the saving process
        .append('svg')
        .attr({
          xmlns:'http://www.w3.org/2000/svg',
          width:chartWidth,
          height:chartHeight
        })
        .append('g')
        .attr('transform','translate(' + chartWidth/2 + ',' + chartWidth/2 + ')');

      svg.selectAll('.arc')
        .data( d3.pie()(pieData) )
        .enter()
        .append('path')
        .attr({
          'class':'arc',
          'd':arc,
          'fill':function(d,i){
            return colours[i];
          },
          'stroke':'#fff'
        });

      //write out the children of the container div
      fs.writeFileSync(outputLocation, window.d3.select('.container').html()) //using sync to keep the code simple

    }
  });
}
*/

module.exports = router;
