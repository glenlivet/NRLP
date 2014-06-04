
var ioUtil 	= require('./io_util.js');
var bops	= require('bops');

var PROTOCOL_NAME = 'NRLP';
var PROTOCOL_VERSION = 1;

//�㲥����
var PROTOCOL_BROADCAST_REQUEST = 1;
//�ṩ����
var PROTOCOL_PROPOSAL_PROVISION = 2;
//������Դ
var PROTOCOL_RESOURCE_REQUEST = 3;
//�����
var PROTOCOL_REQUEST_PERMISSION = 4;
//����ʼ����
var PROTOCOL_REQUEST_START = 5;
//���俪ʼ
var PROTOCOL_TRANSFER_START = 6;

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

var getProtocolHead = function(type){
	return bops.join([getProtocolNameBuffer(), getProtocolVersionBuffer(), getMessageTypeBuffer(type)]);
};

var getMessageTypeBuffer = function(type){
	var buf = new Buffer(1);
	buf.writeInt8(type, 0);
	return buf;
};


var buf = getProtocolHead(PROTOCOL_REQUEST_PERMISSION);
console.log(buf.length);
for(var i = 0 ; i < buf.length; i++){
	console.log(buf[i]);
}

