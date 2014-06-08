/**
 * New node file
 */
var protocol = require('./protocol.js');
var ProposalProvision = require('./proposal_provision.js');

var ppObj = new ProposalProvision();

ppObj.resourceName = "HelloNode";

ppObj.resourceType = protocol.PROTOCOL_RESTYPE_DYNAMIC;
//	protocol.PROTOCOL_RESTYPE_FILE;

//ppObj.resourceSize = 1305;

ppObj.providerId = "Happy";

ppObj.transmissionType = protocol.PROTOCOL_TRANSTYPE_ONESHOT;
	//protocol.PROTOCOL_TRANSTYPE_RETRYABLE;

//ppObj.transmissionSpeed = 150;

var buf = ppObj.toBuffer();

console.log('buf length: ' + buf.length);

ProposalProvision.parse(buf, function(ppCopy){
	console.dir(ppCopy);
});