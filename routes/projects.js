let express = require('express');
// let projParse = require('../lib/projectsParse');
let router = express.Router();

/* GET home page. */
router.get('/', function (req, res, next) {
  // Parse the returned JSon
  let projectsList = [];

  req.session.projects.forEach(function (p) {
    let item = { id: p.id, name: p.fields.name };
    projectsList.push(item); // Push the current project
  });

  res.render('projects', { title: 'Jama Software Capstone', projects: projectsList });
});

module.exports = router;
