let express = require('express');
let auth = require('../lib/auth');
let projects = require('../lib/projects');
let router = express.Router();

/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('index', {title: 'JamaTrace', teamName: req.session.teamName,  error: 'false'});
});

router.post('/', function (req, res, next) {
  req.body.teamName = req.session.teamName;
  if (auth.validate(req)) {
    auth.authenticate(req.body.username, req.body.password, req.body.teamName).then(function (sessionProjects) {
      req.session.username = req.body.username;
      req.session.password = req.body.password;
      req.session.projects = projects.parseProjectList(sessionProjects);
      req.session.save(function (err) {
        if (err) {
          // TODO Session save Error message
          res.render('index', { title: 'JamaTrace', error: 'true' });
        }
        res.redirect('/projects');
      });
    }, function () {
      res.render('index', { title: 'JamaTrace',
                            error: 'true'
                          });
    });
  } else {
    res.render('index', { title: 'JamaTrace',
                          error: 'true',
                          error: 'Your login attempt was not successful. The user credentials you entered were not valid, please try again.'
                        });
  }
});

module.exports = router;
