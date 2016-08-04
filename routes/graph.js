let express = require('express');
let router = express.Router();

let Graph = require('./../lib/graph');

/* GET Project */
router.get('/', function (req, res) {
  if (req.query.project) {
    if (req.session.username && req.session.password && req.session.teamName) {
      let graph = new Graph(req.query.project, 'http://' + req.session.username + ':' +
        req.session.password + '@' + req.session.teamName + '.jamacloud.com/rest/latest/')
        .ready.then(() => {
          res.json(graph.toJson());
        });
    }
  } else {
    res.render('graph', {
      title: 'Jama Software Capstone',
      subtitle: 'Graph',
      projects: req.session.projects ? req.session.projects : null
    });
  }
});

module.exports = router;
