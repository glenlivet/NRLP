
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

var PROTOCOL_ERROR_INCOMPLETE = 0;
var PROTOCOL_ERROR_INCOMPATIBLE_VERSION = -1;
var PROTOCOL_ERROR_UNKNOWN_PROTOCOL_NAME = -2;
var PROTOCOL_ERROR_UNKNOWN_MESSAGE_TYPE = -3;

//�������
module.exports.PROTOCOL_BROADCAST_REQUEST = PROTOCOL_BROADCAST_REQUEST;
module.exports.PROTOCOL_PROPOSAL_PROVISION = PROTOCOL_PROPOSAL_PROVISION;
module.exports.PROTOCOL_RESOURCE_REQUEST = PROTOCOL_RESOURCE_REQUEST;
module.exports.PROTOCOL_REQUEST_PERMISSION = PROTOCOL_REQUEST_PERMISSION;
module.exports.PROTOCOL_REQUEST_START = PROTOCOL_REQUEST_START;
module.exports.PROTOCOL_TRANSFER_START = PROTOCOL_TRANSFER_START;

module.exports.PROTOCOL_ERROR_INCOMPLETE = PROTOCOL_ERROR_INCOMPLETE;
module.exports.PROTOCOL_ERROR_INCOMPATIBLE_VERSION = PROTOCOL_ERROR_INCOMPATIBLE_VERSION;
module.exports.PROTOCOL_ERROR_UNKNOWN_PROTOCOL_NAME = PROTOCOL_ERROR_UNKNOWN_PROTOCOL_NAME;
module.exports.PROTOCOL_ERROR_UNKNOWN_MESSAGE_TYPE = PROTOCOL_ERROR_UNKNOWN_MESSAGE_TYPE;

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

/**
 * ��֤Э��ͷ��
 * @param block ���յ�����Ϣ��. 
 * @return ��Э��ͷ����ȷʱ������ С�ڵ����� �ı�ʶ�롣
 *			��Э����ȷʱ�����ظ���Ϣ�������ʶ�롣
 *
 */
var validateProtocolHead = function(block){
    if(block.length < 8){
        return PROTOCOL_ERROR_INCOMPLETE;    
    }
    var head = new Buffer(8);
    block.copy(head, 0, 0, 8);
    var _head = getProtocolHead(PROTOCOL_BROADCAST_REQUEST);
    for(var i=0; i<6;i++){
        if(head[i] !== _head[i]){
            return PROTOCOL_ERROR_UNKNOWN_PROTOCOL_NAME;
        }
    }
    if(head[6] !== _head[6]){
        return PROTOCOL_ERROR_INCOMPATIBLE_VERSION;    
    }
    if(head[7] > 6 || head[7] < 1){
        return PROTOCOL_ERROR_UNKNOWN_MESSAGE_TYPE;
    }

    //ELSE
    return head[7];
    
};

//�������
module.exports.validateProtocolHead = validateProtocolHead;
module.exports.getProtocolHead = getProtocolHead;

var test = function(){
	var buf = getProtocolHead(PROTOCOL_REQUEST_PERMISSION);
	var rtn = validateProtocolHead(buf);
	console.log(rtn);
};

module.exports.test = test;
