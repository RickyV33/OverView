let express = require('express');
let auth = require('../lib/auth');
let projects = require('../lib/projects');
let router = express.Router();

/* GET home page. */
router.get('/', (req, res, next) => {
  res.render('index', {title: 'JamaTrace'});
});

router.post('/', (req, res, next) => {
  let teamName = process.env.TEAM_NAME;
  req.body.teamName = teamName;
  if (auth.validate(req)) {
    auth.authenticate(req.body.username, req.body.password, teamName).then(sessionProjects => {
      req.session.username = req.body.username;
      req.session.password = req.body.password;
      req.session.projects = projects.parseProjectList(sessionProjects);
      req.session.save(err => {
        if (err) {
          // TODO Session save Error message
          res.render('index', { title: 'JamaTrace', error: true });
        }
        res.redirect('/graph');
      });
    }, () => {
      res.render('index', { title: 'JamaTrace', error: true });
    });
  } else {
    res.render('index', { title: 'JamaTrace', error: true });
  }
});

module.exports = router;
