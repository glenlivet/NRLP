

var protocol_head = require('./protocol_head.js');
var bops = require('bops');
var io_util = require('./io_util.js');
var protocol = require('./protocol.js');

var TransmissionRequest = module.exports = function TransmissionRequest(){
	// 
	this.transmissionCode = null;
	// the byte length of the parameters
	this.lengthOfParams = null;
	// the params used while generating the resource for transmission
	this.parameters = null;
};

TransmissionRequest.prototype.toBuffer = function(){
	// write protocol head
	var headBuf = protocol_head
			.getProtocolHead(protocol_head.PROTOCOL_TRANSMISSION_REQUEST);
	// write the transmissionCode
	var transCodeBuf = new Buffer(2);
	transCodeBuf.writeUInt16BE(this.transmissionCode, 0);
	// write the length of paramters
	var lenOfParamsBuf = io_util.writeMultiByteInteger(this.parameters.length);
	// write the params
	var paramsBuf = this.parameters;
	
	bops.join([headBuf, transCodeBuf, lenOfParamsBuf, paramsBuf]);
			
};

