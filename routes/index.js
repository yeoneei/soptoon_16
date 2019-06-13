var express = require('express');
var router = express.Router();

router.use('/episode', require('./episode'));

router.use('/user', require('./user/index'));
router.use('/comments',require('./comments/index'));

module.exports = router;
