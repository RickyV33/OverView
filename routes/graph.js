let express = require('express');
let router = express.Router();

/* GET Project */
router.get('/', function (req, res) {
  res.render('graph', {
    title: 'Jama Software Capstone',
    subtitle: 'Project',
    projectId: req.query.projectId,
    rootId: (req.query.rootId ? req.query.rootId : 'null')
  });
});

module.exports = router;
