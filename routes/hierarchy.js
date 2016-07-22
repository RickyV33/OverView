let express = require('express');

let router = express.Router();

let itemHierarchy = [];

/* GET item hierarchy page */
router.get('/', function (req, res, next) {
  res.render('hierarchy', {title: 'Select a Root Item (Optional) ', itemHierarchy: itemHierarchy});
});

module.exports = router;
