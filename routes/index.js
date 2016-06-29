var express = require('express');
var auth = require('../lib/auth');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Jama Software Capstone' });
});

router.post('/', function(req, res, next) {
  if (auth.validate(req)) {
    auth.authenticate(req.body.username, req.body.password);
    res.render('index', { title: 'Welcome to JamaTrace.' });
  } else {
    res.render('index', { title: 'Error: Incorrect username and/or password, please try again.' });
  }

});

module.exports = router;
