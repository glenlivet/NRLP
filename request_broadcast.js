
var protocol_head 	= require('./protocol_head.js');
var bops			= require('bops');
var io_util			= require('./io_util.js');

var RequestBroadcast = module.exports = function RequestBroadcast(){
	//资源请求者的ID
	this.requesterId = null;
	//请求资源的名称
	this.requestedResourceName = null;
	//请求资源的类型
	this.requestedResourceType = null;
	//请求的传输方式
	this.transTypeRequirement = null;
	//方案监听的URL
	this.proposalDropLocation = null;
};

RequestBroadcast.prototype.toBuffer = function(){
	//protocol 头
	var headBuf = protocol_head.getProtocolHead(protocol_head.PROTOCOL_BROADCAST_REQUEST);
	//资源请求者的ID
	var ridBuf = io_util.writeUTF8(this.requesterId);
	//请求资源的名称
	var rrnBuf = io_util.writeUTF8(this.requestedResourceName);
	//请求资源的类型
	var rrtBuf = new Buffer(2);
	rrtBuf.writeUInt16BE(this.requestedResourceType, 0);
	//请求的传输方式
	var ttrBuf = new Buffer(1);
	ttrBuf.writeUInt8(this.transTypeRequirement);
	//方案监听的URL
	var pdlBuf = io_util.writeUTF8(this.proposalDropLocation);
	
	return bops.join([headBuf, ridBuf, rrnBuf, rrtBuf, ttrBuf, pdlBuf]);
};



