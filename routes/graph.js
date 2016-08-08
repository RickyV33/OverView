let express = require('express');
let router = express.Router();
let projectquire = require('../lib/projectquire');

/* GET Project */
router.get('/', function (req, res) {
  res.render('graph', {
    title: 'Jama Software Capstone',
    subtitle: 'Project',
    projectId: req.query.id,
    rootId: (req.query.rootId ? req.query.rootId : 'null')
  });
});

router.get('/getGraphData', function (req, res) {
  console.log('*** getGraphData ***');
  let obj = projectquire.getProjectItems(req.query.id, req.query.url).then( function (value) {
    console.log('=== getProject Items ===');
    console.log(value);
    return value;
  });

  res.send(obj);
});

module.exports = router;
