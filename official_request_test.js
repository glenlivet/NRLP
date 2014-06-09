
var OfficialRequest = require('./official_request.js');
var protocol = require('./protocol.js');

var or = new OfficialRequest();
or.requesterId = 'aa';
or.resourceName = 'ff.jpg';
or.resourceType = protocol.PROTOCOL_RESTYPE_FILE;
or.transmissionType = protocol.PROTOCOL_TRANSTYPE_RETRYABLE;
or.requestCode = 66;

var orBuf = or.toBuffer();
console.log(orBuf.length);

OfficialRequest.parse(orBuf, function(orCopy){
	console.dir(orCopy);
});