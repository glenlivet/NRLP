
var protocol_head = require('../protocol_head.js');
var bops = require('bops');
var io_util = require('../io_util.js');
var protocol = require('../protocol.js');

var OfficialResponse = module.exports = function OfficialResponse(){
	
	this.messageType = protocol_head.PROTOCOL_OFFICIAL_RESPONSE;
	this.requestCode = null;
	this.providerId = null;
	this.transmissionCode = null;
	this.resourceLocation = null;
};

OfficialResponse.prototype.toBuffer = function(){
	// get Protocol head byte array.
	var headBuf = protocol_head
			.getProtocolHead(protocol_head.PROTOCOL_OFFICIAL_RESPONSE);
	// write requestCode
	var reqCodeBuf = new Buffer(2);
	reqCodeBuf.writeUInt16BE(this.requestCode, 0);
	// write provider ids
	var pidBuf = io_util.writeUTF8(this.providerId);
	// write transmission code
	var transCodeBuf = new Buffer(2);
	transCodeBuf.writeUInt16BE(this.transmissionCode, 0);
	// write resource location
	var resLocBuf = io_util.writeUTF8(this.resourceLocation);
	
	return bops.join([headBuf, reqCodeBuf, pidBuf, transCodeBuf, resLocBuf]);
	
};

OfficialResponse.parse = function(block, cb){
	
	var rtn = new OfficialResponse();
	//remove the first 8 bytes, it's the head
	var buf = block.slice(8);
	// read request code
	rtn.requestCode = buf.readUInt16BE(0);
	// remove this part
	var rest1 = buf.slice(2);
	// read provider ids
	io_util.readUTF8(rest1, function(pid, rest2){
		rtn.providerId = pid;
		// read transmissionCode
		rtn.transmissionCode = rest2.readUInt16BE(0);
		// remove this part
		var rest3 = rest2.slice(2);
		// read resourceLocation
		io_util.readUTF8(rest3, function(resLoc, rest4){
			rtn.resourceLocation = resLoc;
			cb(rtn);
		});
	});
};