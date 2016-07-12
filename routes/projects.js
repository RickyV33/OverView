let express = require('express');
let router = express.Router();

/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('projects', { title: 'Select a Project: ', projects: req.session.projects });
});

module.exports = router;
