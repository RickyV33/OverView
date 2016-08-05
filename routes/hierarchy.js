let express = require('express');
let hierarchy = require('../lib/hierarchy');
let router = express.Router();

router.get('/', function (req, res, next) {
  hierarchy.getItemHierarchy(req.session.username, req.session.password, req.session.teamName, 33)
    .then(function (allItems) {
      req.session.itemHierarchy = hierarchy.parseItemHierarchy(allItems);
      res.render('hierarchy', {
        title: 'Select a Root Item (Optional) ',
        itemHierarchy: req.session.itemHierarchy
      });
    });
  req.session.save(function (err) {
    if (err) {
      // TODO Session save Error message
    } else {
      res.render('hierarchy', {
        title: 'Select a Root Item (Optional) ',
        itemHierarchy: req.session.itemHierarchy ? req.session.itemHierarchy : []
      });
    }
  });
});

module.exports = router;
