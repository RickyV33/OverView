let express = require('express');
let auth = require('../lib/auth');
let projects = require('../lib/projects');
let router = express.Router();

/* GET home page. */
router.get('/', (req, res, next) => {
  res.render('index', {title: 'JamaTrace', teamName: req.session.teamName});
});

router.post('/', (req, res, next) => {
  req.body.teamName = req.session.teamName;
  if (auth.validate(req)) {
    auth.authenticate(req.body.username, req.body.password, req.body.teamName).then(sessionProjects => {
      req.session.username = req.body.username;
      req.session.password = req.body.password;
      req.session.projects = projects.parseProjectList(sessionProjects);
      req.session.save(err => {
        if (err) {
          // TODO Session save Error message
          res.render('index', { title: 'JamaTrace', teamName: req.body.teamName, error: true });
        }
        res.redirect('/projects');
      });
    }, () => {
      res.status(401);
      res.render('index', { title: 'JamaTrace', teamName: req.body.teamName, error: true });
    });
  } else {
    res.status(401);
    res.render('index', { title: 'JamaTrace', teamName: req.body.teamName, error: true });
  }
});

module.exports = router;
