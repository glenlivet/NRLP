
var protocol_head 	= require('./protocol_head.js');
var bops			= require('bops');
var io_util			= require('./io_util.js');

var RequestBroadcast = module.exports = function RequestBroadcast(){
	//��Դ�����ߵ�ID
	this.requesterId = null;
	//������Դ������
	this.requestedResourceName = null;
	//������Դ������
	this.requestedResourceType = null;
	//����Ĵ��䷽ʽ
	this.transTypeRequirement = null;
	//����������URL
	this.proposalDropLocation = null;
};

RequestBroadcast.prototype.toBuffer = function(){
	//protocol ͷ
	var headBuf = protocol_head.getProtocolHead(protocol_head.PROTOCOL_BROADCAST_REQUEST);
	//��Դ�����ߵ�ID
	var ridBuf = io_util.writeUTF8(this.requesterId);
	//������Դ������
	var rrnBuf = io_util.writeUTF8(this.requestedResourceName);
	//������Դ������
	var rrtBuf = new Buffer(2);
	rrtBuf.writeUInt16BE(this.requestedResourceType, 0);
	//����Ĵ��䷽ʽ
	var ttrBuf = new Buffer(1);
	ttrBuf.writeUInt8(this.transTypeRequirement);
	//����������URL
	var pdlBuf = io_util.writeUTF8(this.proposalDropLocation);
	
	return bops.join([headBuf, ridBuf, rrnBuf, rrtBuf, ttrBuf, pdlBuf]);
};



