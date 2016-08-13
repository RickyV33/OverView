let express = require('express');
let auth = require('../lib/auth');
let projects = require('../lib/projects');
let router = express.Router();

/* GET home page. */
router.get('/', (req, res, next) => {
  res.render('index', { title: 'JamaTrace' });
});

router.post('/', (req, res, next) => {
  if (auth.validate(req)) {
    auth.authenticate(req.body.username, req.body.password, req.body.teamName).then(sessionProjects => {
      req.session.username = req.body.username;
      req.session.password = req.body.password;
      req.session.teamName = req.body.teamName;
      req.session.projects = projects.parseProjectList(sessionProjects);
      req.session.save(err => {
        if (err) {
          // TODO Session save Error message
          res.render('index', { title: err });
        }
        res.redirect('/projects');
      });
    }, () => {
      res.render('index', { title: 'Error: Incorrect credentials, please try again.' });
    });
  } else {
    res.render('index', { title: 'Error: Incorrect credentials, please try again.' });
  }
});

module.exports = router;
