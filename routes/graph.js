let express = require('express');
let router = express.Router();

/* GET Project */
router.get('/', function (req, res) {
  res.render('graph', {
    title: 'Jama Software Capstone',
    subtitle: 'Graph',
    projects: req.session.projects ? req.session.projects : null
  });
});

module.exports = router;
