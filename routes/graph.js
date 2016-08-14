let express = require('express');
let router = express.Router();
let Graph = require('../lib/graph');

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
  let url = 'http://' + req.session.username + ':' + req.session.password + '@' + req.session.teamName + '.jamacloud.com/rest/latest/';
  try {
    let graphObj = new Graph(req.query.id, url);
    graphObj.buildGraph().then(function (value) {
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
