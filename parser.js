
var protocol_head = require('./protocol_head.js');

var PROTOCOL_ERROR_MSG = 'It is not a NRLP message.';

var RequestBroadcast = require('./request_broadcast.js');


/**
 * ��buffer ת���ɶ�Ӧ���͵�msg����
 * @param block	buffer
 * @param msgType ��Ϣ����
 */
var parse = function(block, msgType){
	var rtnCode = protocol_head.validateProtocolHead(block);
	if(rtnCode <= 0 || rtnCode > 6){
		throw new Error(PROTOCOL_ERROR_MSG);
	}
	
	var rtnMsgObj = null;
	switch(rtnCode){
		//�㲥����
		case protocol_head.PROTOCOL_BROADCAST_REQUEST:
			rtnMsgObj = parseBroadcastRequest(block);
			break;
		//�ṩ����
		case protocol_head.PROTOCOL_PROPOSAL_PROVISION:
			rtnMsgObj = parseProposalProvision(block);
			break;
		//������Դ
		case protocol_head.PROTOCOL_RESOURCE_REQUEST:
			rtnMsgObj = parseResourceRequest(block);
			break;
		//�����
		case protocol_head.PROTOCOL_REQUEST_PERMISSION:
			rtnMsgObj = parseRequestPermission(block);
			break;
		//��ʼ����
		case protocol_head.PROTOCOL_REQUEST_START:
			rtnMsgObj = parseRequestStart(block);
			break;
		//���俪ʼ
		case protocol_head.PROTOCOL_TRANSFER_START:
			rtnMsgObj = parseTransferStart(block);
			break;
	}
	
	return rtnMsgObj;
};

/**
 * ��buffer����Ϊ BroadcastRequest ����
 * @param block buffer
 */
var parseBroadcastRequest = function(block){
	
};