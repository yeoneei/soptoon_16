var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.use('/user/signin', require('./user/signin'))
router.use('/user/signup', require('./user/signup'))
router.use('/comments',require('./comments'));
module.exports = router;
