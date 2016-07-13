let express = require('express');
let router = express.Router();

/* GET home page. */
router.get('/', function (req, res, next) {
  res.status(200);
  res.render('projects', { title: 'Projects', projects: req.session.projects });
});

module.exports = router;
