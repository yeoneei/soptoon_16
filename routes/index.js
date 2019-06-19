var express = require('express');
var router = express.Router();

<<<<<<< HEAD
router.use('/episode', require('./episode'));

router.use('/user', require('./user/index'));
router.use('/comments',require('./comments/index'));
=======

router.use('/webtoons',require('./webtoons/index'));
router.use('/episodes',require('./episodes/index'));
/* GET home page. */  
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});
>>>>>>> yeoni

module.exports = router;
