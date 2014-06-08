
var protocol_head 	= require('./protocol_head.js');
var bops			= require('bops');
var io_util			= require('./io_util.js');

var RequestBroadcast = module.exports = function RequestBroadcast(){
	//��Դ�����ߵ�ID
	this.requesterId = null;
	//������Դ�����
	this.requestedResourceName = null;
	//������Դ������
	this.requestedResourceType = null;
	//����Ĵ��䷽ʽ
	this.transTypeRequirement = null;
	//���������URL
	this.proposalDropLocation = null;
};

RequestBroadcast.prototype.toBuffer = function(){
	//protocol ͷ
	var headBuf = protocol_head.getProtocolHead(protocol_head.PROTOCOL_BROADCAST_REQUEST);
	//��Դ�����ߵ�ID
	var ridBuf = io_util.writeUTF8(this.requesterId);
	//������Դ�����
	var rrnBuf = io_util.writeUTF8(this.requestedResourceName);
	//������Դ������
	var rrtBuf = new Buffer(2);
	rrtBuf.writeUInt16BE(this.requestedResourceType, 0);
	//����Ĵ��䷽ʽ
	var ttrBuf = new Buffer(1);
	ttrBuf.writeUInt8(this.transTypeRequirement, 0);
	//���������URL
	var pdlBuf = io_util.writeUTF8(this.proposalDropLocation);
	
	return bops.join([headBuf, ridBuf, rrnBuf, rrtBuf, ttrBuf, pdlBuf]);
};

RequestBroadcast.parse = function(block, cb){
	
	var rtn = new RequestBroadcast();
	//remove the first 8 bytes, it's the head
	var buf = block.slice(8, block.length);
	//retrieve requesterId
	io_util.readUTF8(buf, function(rid, rest1){
		rtn.requesterId = rid;
		//retrieve request resource name
		io_util.readUTF8(rest1, function(resourceName, rest2){
			rtn.requestedResourceName = resourceName;
			//retrieve requestedResourceType
			rtn.requestedResourceType = rest2.readUInt16BE(0);
			//remove this part
			var rest3 = rest2.slice(2);
			//retrieve transTypeRequirement
			rtn.transTypeRequirement = rest3.readUInt8(0);
			//remove this part
			var rest4 = rest3.slice(1);
			//retrieve proposalDropLocation
			rtn.proposalDropLocation = io_util.readUTF8Sync(rest4);
			cb(rtn);
		});
	});
	
};


/**
 * 
 * @param block
 */
RequestBroadcast.parseSync = function(block){
	var rtn = new RequestBroadcast();
	//remove the first 8 bytes, it's the head
	var buf = block.slice(8, block.length);
	//retrieve requesterId
	rtn.requesterId = io_util.readUTF8Sync(buf);
	//remove the requesterId part
	buf = io_util.dropFirstUTF8(buf);
	//retrieve request resource name
	rtn.requestedResourceName = io_util.readUTF8Sync(buf);
	//remove this part
	buf = io_util.dropFirstUTF8(buf);
	//retrieve requestedResourceType
	rtn.requestedResourceType = buf.readUInt16BE(0);
	//remove this part
	buf = buf.slice(2);
	//retrieve transTypeRequirement
	rtn.transTypeRequirement = buf.readUInt8(0);
	//remove this part
	buf = buf.slice(1);
	//retrieve proposalDropLocation
	rtn.proposalDropLocation = io_util.readUTF8Sync(buf);
	
	return rtn;
};




