let express = require('express');
let hierarchy = require('../lib/hierarchy');

let router = express.Router();

let rootItemSelected = '';
let itemHierarchy = [];
let children = [];
let results = [];

/* GET item hierarchy page */
router.get('/', function(req, res, next) {
    // These lines will replace line 14 with the explicit URL
  // let url = 'http://' + req.session.username + ':' + req.session.password + '@' + req.session.teamname + '.jamacloud.com/rest/latest/';
  hierarchy.getRootItems(33, 'http://dummy:password@sevensource.jamacloud.com/rest/latest/').then(function(rootItems){
      itemHierarchy = hierarchy.parseRootItems(rootItems);
      itemHierarchy.forEach(function(rootItem){
          children = [];
          hierarchy.getSubItems('http://dummy:password@sevensource.jamacloud.com/rest/latest/', rootItem.id).then(function(subItems){
              children = hierarchy.parseSubRootItems(subItems);
              children.forEach(function(child){
                  rootItem.children.push(child);
              });
              rootItem.children.forEach(function(child){
                  console.log('child in router: ;' + child.name);
              });
              results.push(rootItem);
          });
      });


      /*req.sesseion.itemHierarchy = itemHierarchy;
      req.session.save(function (err) {
          if (err) {
              // TODO Session save Error message
          }
          else {
            res.render('hierarchy', {
              title: 'Select a Root Item (Optional) ',
              itemHierarchy: req.session.itemHierarchy
            });
          }
      });*/
  });
    console.log('results');
    res.render('hierarchy', {
        title: 'Select a Root Item (Optional) ',
        itemHierarchy: results
    });

});

module.exports = router;
