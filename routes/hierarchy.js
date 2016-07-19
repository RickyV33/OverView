let express = require('express');
let router = express.Router();

let rootItemSelected = '';
let itemHierarchy = {};

/* GET item hierarchy page */
router.get('/', function(req, res, next){
    // get a item hierarchy and make sure it's been validated for valid item hierarchy items.
    itemHierarchy = getItemHierarchy();
    res.render('hierarchy', {title: 'Please select a a root node, or click render graph to render from the project root: ',
    itemHierarchy: itemHierarchy});
});

router.post('/', function(req, res, next){
    rootItemSelected = res.selectedItem;
});

module.exports = router;
