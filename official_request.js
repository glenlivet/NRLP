
var protocol_head = require('./protocol_head.js');
var bops = require('bops');
var io_util = require('./io_util.js');
var protocol = require('./protocol.js');

var OfficialRequest = module.exports = function OfficialRequest(){
	this.requesterId = null;
	this.resourceName = null;
	this.resourceType = null;
	this.transmissionType = null;
	this.requestCode = null;
};

OfficialRequest.prototype.toBuffer = function(){
	// get Protocol head byte array.
	var headBuf = protocol_head
			.getProtocolHead(protocol_head.PROTOCOL_OFFICIAL_REQUEST);
	// write the requesterId
	var ridBuf = io_util.writeUTF8(this.requesterId);
	// write the resource name
	var resNameBuf = io_util.writeUTF8(this.resourceName);
	// write the resource type
	var resTypeBuf = new Buffer(2);
	resTypeBuf.writeUInt16BE(this.resourceType, 0);
	// write the transmissionType
	var transTypeBuf = new Buffer(1);
	transTypeBuf.writeUInt8(this.transmissionType, 0);
	// write the request code
	var requestCodeBuf = new Buffer(2);
	requestCodeBuf.writeUInt16BE(this.requestCode, 0);
	
	return bops.join([headBuf, ridBuf, resNameBuf, resTypeBuf, transTypeBuf, requestCodeBuf]);
};

OfficialRequest.parse = function(block, cb){
	
	var rtn = new OfficialRequest();
	//remove the first 8 bytes, it's the head
	var buf = block.slice(8);
	//read the requester id
	io_util.readUTF8(buf, function(rid, rest1){
		rtn.requesterId = rid;
		//read the resource name
		io_util.readUTF8(rest1, function(resName, rest2){
			rtn.resourceName = resName;
			// read the resource type
			rtn.resourceType = rest2.readUInt16BE(0);
			// remove this part
			var rest3 = rest2.slice(2);
			// read the transmission type
			rtn.transmissionType = rest3.readUInt8(0);
			// remove this part
			var rest4 = rest3.slice(1);
			//read the request code
			rtn.requestCode = rest4.readUInt16BE(0);
			cb(rtn);
		});
	});
};