let express = require('express');
let router = express.Router();
let auth = require('../lib/auth');

/* GET home page. */
router.get('/', auth.isAuthenticated, function (req, res, next) {
  res.render('projects', {title: 'Projects', projects: req.session.projects ? req.session.projects : null});
});

module.exports = router;
