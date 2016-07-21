let express = require('express');
let router = express.Router();

/* GET Project */
router.get('/:projectId', function (req, res) {
  res.render('graph', {
    title: 'Jama Software Capstone',
    subtitle: 'Project',
    projectId: req.param('projectId')
  });
});

module.exports = router;
