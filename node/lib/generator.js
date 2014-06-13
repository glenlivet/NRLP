/**
 * New node file
 */

var RequestBroadcast = require('./msg/request_broadcast.js');
var ProposalProvision = require('./msg/proposal_provision.js');
var OfficialRequest = require('./msg/official_request.js');
var OfficialResponse = require('./msg/official_response.js');
var TransmissionRequest = require('./msg/transmission_request.js');
var protocol = require('./protocol.js');
var io_util = require('./io_util.js');


/**
 * build a proposal provision buffer.
 * @resource	the resource provided.
 * @providerId	the provider id.
 * @transmissionType	the transmission type proposed.
 * @transmissionSpeed	the transmission speed provided.
 */
var buildProposalProvisionBuffer = function(reqCode, resource, providerId, transmissionType, transmissionSpeed){
	var rtn = new ProposalProvision();
	rtn.requestCode = reqCode;
	rtn.resourceName = resource.name;
	rtn.resourceType = resource.type;
	rtn.resourceSize = resource.size;
	rtn.providerId   = providerId;
	rtn.transmissionType = transmissionType;
	rtn.transmissionSpeed = transmissionSpeed;	
	return rtn.toBuffer();
};

/**
 * request broadcast
 */
var buildRequestBroadcastBuffer = function(transmissionTask, requesterId){
	var rtn = new RequestBroadcast();
	rtn.requesterId = requesterId;
	rtn.requestCode = transmissionTask.code;
	rtn.requestedResourceName = transmissionTask.resourceName;
	rtn.requestedResourceType = transmissionTask.resourceType;
	rtn.transTypeRequirement = transmissionTask.transmissionType;
	return rtn.toBuffer();
};

var buildOfficialRequestBuffer = function(transmissionTask, requesterId){
	var rtn = new OfficialRequest();
	rtn.requesterId = requesterId;
	rtn.requestCode = transmissionTask.code;
	rtn.resourceName = transmissionTask.resourceName;
	rtn.resourceType = transmissionTask.resourceType;
	rtn.transmissionType = transmissionTask.transmissionType;
	return rtn.toBuffer();
};

var buildOfficialResponseBuffer = function(transTask, providerId, resLoc){
	var rtn = new OfficialResponse();
	rtn.requestCode = transTask.requestCode;
	rtn.providerId = providerId;
	rtn.transmissionCode = transTask.code;
	rtn.resourceLocation = resLoc;
	return rtn.toBuffer();
};

var buildTransmissionRequestBuffer = function(reqTask){
	var rtn = new TransmissionRequest();
	rtn.transmissionCode = reqTask.transmissionCode;
	if(reqTask.transmissionType === protocol.PROTOCOL_TRANSTYPE_RETRYABLE){
		//params 为其接收的长度
		rtn.parameters = io_util.writeMultiByteInteger(reqTask.received);
	}else{
		rtn.parameters = reqTask.params || new Buffer(0);
	}
	rtn.lengthOfParams = rtn.parameters.length;
	return rtn.toBuffer();
};

exports.buildProposalProvisionBuffer = buildProposalProvisionBuffer;
exports.buildRequestBroadcastBuffer = buildRequestBroadcastBuffer;
exports.buildOfficialRequestBuffer = buildOfficialRequestBuffer;
exports.buildOfficialResponseBuffer = buildOfficialResponseBuffer;
exports.buildTransmissionRequestBuffer = buildTransmissionRequestBuffer;