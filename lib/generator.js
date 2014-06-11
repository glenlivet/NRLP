/**
 * New node file
 */

var RequestBroadcast = require('./msg/request_broadcast.js');
var ProposalProvision = require('./msg/proposal_provision.js');
var OfficialRequest = require('./msg/official_request.js');
var parseOfficialResponse = require('./msg/official_response.js');


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

exports.buildProposalProvisionBuffer = buildProposalProvisionBuffer;
exports.buildRequestBroadcastBuffer = buildRequestBroadcastBuffer;
exports.buildOfficialRequestBuffer = buildOfficialRequestBuffer;
