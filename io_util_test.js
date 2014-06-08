/**
 * New node file
 */


var io_util = require('./io_util.js');

var buft = io_util.writeMultiByteInteger(789);
for(var i = 0; i < buft.length; i++){
	console.log('buft[' + i + ']: ' + buft[i]);
}

io_util.readMultiByteInteger(buft, function(num, r){
	console.log('num: ' + num);
	console.log('r size: ' + r.length);
});