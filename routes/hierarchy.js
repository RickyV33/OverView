let express = require('express');
let hierarchy = require('../lib/hierarchy');
let router = express.Router();

router.get('/', (req, res, next) => {
  hierarchy.getAllItems(req.session.username, req.session.password, req.session.teamName, req.query.project)
    .then(allItems => {
      res.json(hierarchy.parseItemHierarchy(allItems));
    })
    .catch(err => {
      console.dir(err);
      throw (err);
    });
});

module.exports = router;
