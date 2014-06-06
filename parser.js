
var protocol_head = require('./protocol_head.js');

var PROTOCOL_ERROR_MSG = 'It is not a NRLP message.';

var RequestBroadcast = require('./request_broadcast.js');


/**
 * 将buffer 转化成对应类型的msg对象
 * @param block	buffer
 * @param msgType 消息类型
 */
var parse = function(block, msgType){
	var rtnCode = protocol_head.validateProtocolHead(block);
	if(rtnCode <= 0 || rtnCode > 6){
		throw new Error(PROTOCOL_ERROR_MSG);
	}
	
	var rtnMsgObj = null;
	switch(rtnCode){
		//广播请求
		case protocol_head.PROTOCOL_BROADCAST_REQUEST:
			rtnMsgObj = parseBroadcastRequest(block);
			break;
		//提供方案
		case protocol_head.PROTOCOL_PROPOSAL_PROVISION:
			rtnMsgObj = parseProposalProvision(block);
			break;
		//请求资源
		case protocol_head.PROTOCOL_RESOURCE_REQUEST:
			rtnMsgObj = parseResourceRequest(block);
			break;
		//请求答复
		case protocol_head.PROTOCOL_REQUEST_PERMISSION:
			rtnMsgObj = parseRequestPermission(block);
			break;
		//开始请求
		case protocol_head.PROTOCOL_REQUEST_START:
			rtnMsgObj = parseRequestStart(block);
			break;
		//传输开始
		case protocol_head.PROTOCOL_TRANSFER_START:
			rtnMsgObj = parseTransferStart(block);
			break;
	}
	
	return rtnMsgObj;
};

/**
 * 将buffer解析为 BroadcastRequest 对象
 * @param block buffer
 */
var parseBroadcastRequest = function(block){
	
};