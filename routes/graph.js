let express = require('express');
let router = express.Router();

let Graph = require('./../lib/graph');

router.get('/', function (req, res) {
  if (req.query.project) {
    if (req.session.username && req.session.password && req.session.teamName) {
      let graph = new Graph(req.params.id, 'http://' + req.session.username + ':' +
        req.session.password + '@' + req.session.teamName + '.jamacloud.com/rest/latest/');
      graph.buildGraph().then(() => {
        res.status(200).json(graph.toJson());
      });
    }
  } else {
    res.render('graph', {
      title: 'JamaTrace',
      subtitle: 'Graph',
      projects: req.session.projects ? req.session.projects : null,
      itemHierarchy: null
    });
  }
});

module.exports = router;
