let express = require('express');
let router = express.Router();

let Graph = require('./../lib/graph');

router.get('/', function (req, res) {
  if (req.query.project) {
    if (req.session.username && req.session.password && req.session.teamName) {
      let graph = new Graph(req.query.project, 'http://' + req.session.username + ':' +
        req.session.password + '@' + req.session.teamName + '.jamacloud.com/rest/latest/');
      graph.buildGraph(() => {
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

router.post('/update-hierarchy', function (req, res) {
  console.log('post');
  res.render('partials/hierarchy', { itemHierarchy: req.body }, (err, html) => {
    console.log(err);
    console.log(html);
    if (err){
      console.error(err);
    } else {
      res.status(200).send(html).end();
    }
  });
});

module.exports = router;
