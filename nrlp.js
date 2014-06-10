
var parser = require('./parser.js');


var parse = function(block, cb){
	parser.parse(block, cb);
};

exports.parse = parse;