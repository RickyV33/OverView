let express = require('express');
let router = express.Router();

/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('projects', { title: 'Jama Software Capstone', projects: req.session.projects });
});

module.exports = router;
