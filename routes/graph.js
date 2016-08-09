let express = require('express');
let router = express.Router();

let Graph = require('./../lib/graph');

router.get('/', function (req, res) {
    res.render('graph', {
      title: 'JamaTrace',
      subtitle: 'Graph',
      projects: req.session.projects ? req.session.projects : null,
      itemHierarchy: null
    });
});

router.get('/getGraphData/:id', function (req, res) {
  if (req.session.username && req.session.password && req.session.teamName) {
    let graph = new Graph(req.params.id, 'http://' + req.session.username + ':' +
      req.session.password + '@' + req.session.teamName + '.jamacloud.com/rest/latest/');
    graph.buildGraph(() => {
      res.status(200).json(graph.toJson());
    });
  }
});

module.exports = router;
