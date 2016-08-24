let express = require('express');
let hierarchy = require('../lib/hierarchy');
let router = express.Router();

router.get('/', (req, res, next) => {
  hierarchy.getAllItems(req.session.username, req.session.password, process.env.TEAM_NAME, req.query.project)
    .then(allItems => {
      res.json(hierarchy.parseItemHierarchy(allItems));
    })
    .catch(err => {
      next(err);
    });
});

module.exports = router;
