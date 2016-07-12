let express = require('express');
let auth = require('../lib/auth');
let proj = require('../lib/projects');
let router = express.Router();

/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('index', { title: 'Jama Software Capstone' });
});

router.post('/', function (req, res, next) {
  if (auth.validate(req)) {
    auth.authenticate(req.body.username, req.body.password, req.body.teamName).then(function (projects) {
      req.session.username = req.body.username;
      req.session.password = req.body.password;
      req.session.teamName = req.body.teamName;
      console.log(projects);
      req.session.projects = proj.parseProjectList(projects);
      res.redirect('/projects');
    }, function () {
      res.render('index', { title: 'Error: Incorrect credentials, please try again.' });
    });
  } else {
    res.render('index', { title: 'Error: Incorrect credentials, please try again.' });
  }
});

module.exports = router;
