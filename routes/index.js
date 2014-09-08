var express = require('express');
var router = express.Router();

router.get('/', function(req, res) {
	res.render('./static_pages/index.ejs');
});


module.exports = router;
