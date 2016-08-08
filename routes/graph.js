let express = require('express');
let router = express.Router();
let graph = require('../lib/graph');

/* GET Project */
router.get('/', function (req, res) {
  res.render('graph', {
    title: 'Jama Software Capstone',
    subtitle: 'Project',
    projectId: req.query.id,
    rootId: (req.query.rootId ? req.query.rootId : 'null')
  });
});

router.get('/getGraphData', function (req, res) {
  console.log('*** getGraphData ***');
  let url = 'http://' + req.session.username + ':' + req.session.password + '@' + req.session.teamName + '.jamacloud.com/rest/latest/';
  console.log('Project id: ' + req.query.id);
  try {
    let graphObj = new graph(req.query.id, url);
    graphObj.buildGraph().then( function (value) {
      return res.json(graphObj);
    }, function (error) {
      return res.json(error);
    });
    // return res.json(graphObj);
  } catch (e) {
    console.log(e);
  }
});

module.exports = router;
