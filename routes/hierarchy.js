let express = require('express');
let hierarchy = require('../lib/hierarchy');

let router = express.Router();

let itemHierarchy = [];

/* GET item hierarchy page */
router.get('/', function (req, res, next) {
  // Next two lines will replace line 13 with explicit url
  // let url = 'http://' + req.session.username + ':' + req.session.password + '@' + req.session.teamname + '.jamacloud.com/rest/latest/';
  // hierarchy.getItemHierarchy(req.session.username, req.session.password, req.session.teamName, 33).then(function(allItems){
  hierarchy.getAllItems('dummy', 'password', 'sevensource', 33,
    'http://dummy:password@sevensource.jamacloud.com/rest/latest/').then(function (allItems) {
    // req.session.rootItems = parseItemHierarchy(allItems); to replace the line below
      itemHierarchy = hierarchy.parseItemHierarchy(allItems);
      res.render('hierarchy', {
        title: 'Select a Root Item (Optional) ',
        rootItems: itemHierarchy
      });
     /* req.session.save(function (err) {
      if (err) {
        // TODO Session save Error message
      } else {
        res.render('hierarchy', {
          title: 'Select a Root Item (Optional) ',
          // rootItems: req.session.rootItems to replace the line below
          rootItems: rootItems
        });
      }
    });*/
    });
});

module.exports = router;
