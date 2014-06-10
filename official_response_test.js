

var OfficialResponse = require('./official_response.js');
var protocol = require('./protocol.js');

var or = new OfficialResponse();
or.requestCode = 6535;
or.providerId = 'ffffff';
or.transmissionCode = 3564;
or.resourceLocation = '10.234.31.234:10166';

var buf = or.toBuffer();
console.log(buf.length);

OfficialResponse.parse(buf, function(rtn){
	console.dir(rtn);
});