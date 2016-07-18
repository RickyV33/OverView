let express = require('express');
let router = express.Router();

/* GET Project */
router.get('/:projectId', function (req, res) {
  // let graph = renderSVG();

  res.render('project', {
    title: 'Jama Software Capstone',
    subtitle: 'Project',
    projectId: req.param('projectId')
  });
});

module.exports = router;
