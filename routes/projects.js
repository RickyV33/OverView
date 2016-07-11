let express = require('express');
let router = express.Router();

/* GET home page. */
router.get('/', function (req, res, next) {
  // Parse the returned JSon
  let projectsList = [];

  req.session.projects.forEach(function (p) {
    // id and name are required fields
    if (p.id && p.fields.name) {
      projectsList.push({
        id: p.id,
        name: p.fields.name
      });
    }
  });

  res.render('projects', {
    title: 'Jama Software Capstone',
    projects: projectsList
  });
});

module.exports = router;
