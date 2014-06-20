
var protocol_head = require('./protocol_head.js');

var PROTOCOL_ERROR_MSG = 'It is not a NRLP message.';

var RequestBroadcast = require('./msg/request_broadcast.js');
var ProposalProvision = require('./msg/proposal_provision.js');
var OfficialRequest = require('./msg/official_request.js');
var OfficialResponse = require('./msg/official_response.js');



/**
 * ��buffer ת���ɶ�Ӧ���͵�msg����
 * @param block	buffer
 * @param msgType ��Ϣ����
 */
var parse = function(block, cb){
	var rtnCode = protocol_head.validateProtocolHead(block);
	if(rtnCode <= 0 || rtnCode > 6){
		throw new Error(PROTOCOL_ERROR_MSG);
	}

	switch(rtnCode){
		//�㲥����
		case protocol_head.PROTOCOL_BROADCAST_REQUEST:
			parseBroadcastRequest(block, cb);
			break;
		//�ṩ����
		case protocol_head.PROTOCOL_PROPOSAL_PROVISION:
			parseProposalProvision(block, cb);
			break;
		//������Դ
		case protocol_head.PROTOCOL_OFFICIAL_REQUEST:
			parseOfficialRequest(block, cb);
			break;
		//�����
		case protocol_head.PROTOCOL_OFFICIAL_RESPONSE:
			parseOfficialResponse(block, cb);
			break;
		//��ʼ����
		// case protocol_head.PROTOCOL_TRANSMISSION_REQUEST:
			// rtnMsgObj = parseRequestStart(block);
			// break;
		//���俪ʼ
		// case protocol_head.PROTOCOL_FINAL_RESPONSE:
			// rtnMsgObj = parseTransferStart(block);
			// break;
	}

};

/**
 * parse RequestBroadcast. 
 * @param block the buffer
 */
var parseBroadcastRequest = function(block, cb){
	RequestBroadcast.parse(block, cb);
};

var parseProposalProvision = function(block, cb){
	ProposalProvision.parse(block, cb);
};

var parseOfficialRequest = function(block, cb){
	OfficialRequest.parse(block, cb);
};

var parseOfficialResponse = function(block, cb){
	OfficialResponse.parse(block, cb);
};



exports.parse = parse;