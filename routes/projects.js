let express = require('express');
let projParse = require('../lib/projectsParse');
let router = express.Router();

/* GET home page. */
router.get('/', function (req, res, next) {
  // Parse the returned JSon
  let projectsList = projParse(req.session.projects);
  res.render('projects', { title: 'Jama Software Capstone', projects: projectsList });
});

module.exports = router;
