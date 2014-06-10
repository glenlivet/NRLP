
var protocol_head = require('./protocol_head.js');

var PROTOCOL_ERROR_MSG = 'It is not a NRLP message.';

var RequestBroadcast = require('./request_broadcast.js');


/**
 * 将buffer 转化成对应类型的msg对象
 * @param block	buffer
 * @param msgType 消息类型
 */
var parse = function(block, cb){
	var rtnCode = protocol_head.validateProtocolHead(block);
	if(rtnCode <= 0 || rtnCode > 6){
		throw new Error(PROTOCOL_ERROR_MSG);
	}

	switch(rtnCode){
		//广播请求
		case protocol_head.PROTOCOL_BROADCAST_REQUEST:
			parseBroadcastRequest(block, cb);
			break;
		//提供方案
		case protocol_head.PROTOCOL_PROPOSAL_PROVISION:
			parseProposalProvision(block, cb);
			break;
		//请求资源
		case protocol_head.PROTOCOL_OFFICIAL_REQUEST:
			parseOfficialRequest(block, cb);
			break;
		//请求答复
		case protocol_head.PROTOCOL_OFFICIAL_RESPONSE:
			parseOfficialResponse(block, cb);
			break;
		//开始请求
		// case protocol_head.PROTOCOL_TRANSMISSION_REQUEST:
			// rtnMsgObj = parseRequestStart(block);
			// break;
		//传输开始
		// case protocol_head.PROTOCOL_FINAL_RESPONSE:
			// rtnMsgObj = parseTransferStart(block);
			// break;
	}

};

/**
 * 将buffer解析为 BroadcastRequest 对象
 * @param block buffer
 */
var parseBroadcastRequest = function(block, cb){
	RequestBroadcast.parse(block, cb);
};

exports.parse = parse;