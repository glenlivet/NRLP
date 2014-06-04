
var ioUtil 	= require('./io_util.js');
var bops	= require('bops');

var PROTOCOL_NAME = 'NRLP';
var PROTOCOL_VERSION = 1;

/**
 * 
 */
var getProtocolNameBuffer = function(){
	return ioUtil.writeUTF8(PROTOCOL_NAME);
};

/**
 *
 */
var getProtocolVersionBuffer = function(){
	var buf = new Buffer(1);
	buf.writeInt8(PROTOCOL_VERSION, 0); 
	return buf;
};

var getProtocolHead = function(){
	return bops.join([getProtocolNameBuffer(), getProtocolVersionBuffer()]);
};



// var buf = getProtocolHead();
// console.log(buf.length);
// for(var i = 0 ; i < buf.length; i++){
	// console.log(buf[i]);
// }

