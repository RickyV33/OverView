let express = require('express');
let router = express.Router();

/* GET home page. */
router.get('/', (req, res, next) => {
  res.render('projects', {title: 'Projects', projects: req.session.projects ? req.session.projects : null});
});

module.exports = router;
