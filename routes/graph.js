let express = require('express');
let router = express.Router();

let Graph = require('./../lib/graph');

router.get('/', function (req, res, next) {
  if (req.query.project) {
    if (req.session.username && req.session.password && process.env.TEAM_NAME) {
      let graph = new Graph(parseInt(req.query.project), 'http://' + req.session.username + ':' +
        req.session.password + '@' + process.env.TEAM_NAME + '.jamacloud.com/rest/latest/');
      graph.buildGraph().then(() => {
        res.status(200).json(graph.toJson());
      }).catch(() => {
        // TODO: Catch an actual error from the graph module once it rejects with one
        let error = {
          message: 'Could not retrieve graph.'
        };
        next(error);
      });
    } else {
      // User is unauthorized
      let error = {
        status: 401,
        // TODO: Refactor WWW-Authenticate header to app-level middleware, augmenting 401 responses
        headers: {
          'WWW-Authenticate': 'Forms realm="JamaTrace"'
        },
        message: 'You are unauthorized to perform this operation. Please login.'
      };
      next(error);
    }
  } else {
    res.render('graph', {
      title: 'OverView',
      subtitle: 'Graph',
      projects: req.session.projects ? req.session.projects : null,
      itemHierarchy: null
    });
  }
});

module.exports = router;
