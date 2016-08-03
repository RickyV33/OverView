let express = require('express');
let router = express.Router();

/* GET home page. */
router.get('/', function (req, res, next) {
  req.session.destroy(req.session.id, error => {
    console.log('Error clearing out the session: ' + error);
  });
  res.redirect('/');
});

module.exports = router;
