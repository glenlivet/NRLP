
var protocol_head = require('./protocol_head.js');

var ioUtil = require('./io_util.js');

var RequestBroadcast = require('./request_broadcast.js');

var bops = require('bops');

var buf = bops.join([new Buffer('aa'), null || new Buffer(0), null || new Buffer('bb')]);

console.log(buf.length);
console.log(buf.toString());
//test protocol_head
//protocol_head.test();


/**
 * test ioUtil
 * 
var str = 'abc';

var cc = ioUtil.writeUTF8(str);

for(var i = 0; i < cc.length; i++){
	console.log(cc[i]);
}

console.log('---------');

var ss = ioUtil.readUTF8(cc);
console.log(ss);

 */


/**
 * 
var rb = new RequestBroadcast();

rb.requesterId = 'rid01';

rb.requestedResourceName = 'aa.jpg';

rb.requestedResourceType = 1;

rb.transTypeRequirement = 1;

rb.proposalDropLocation = 'nrlp/proposal/listener/rid01';
 */


/**
 * test efficiency about json and byte
 *
var t1 = new Date().getTime();
var buf = rb.toBuffer();
console.log(new Date().getTime() - t1);
console.log(buf.length);

var t2 = new Date().getTime();
var jsonBuf = new Buffer(JSON.stringify(rb));
console.log(new Date().getTime() - t2);
console.log(jsonBuf.length);


var t3 = new Date().getTime();
var rbCp = RequestBroadcast.parseSync(buf);
console.log(new Date().getTime() - t3);
console.dir(rbCp);

var t4 = new Date().getTime();
var rbCp2 = JSON.parse(jsonBuf.toString());
console.log(new Date().getTime() - t4);
 */

/*var buf  = rb.toBuffer();

var t1 = new Date().getTime();
var rbCp = RequestBroadcast.parseSync(buf);
var timeUsed = new Date().getTime() - t1;
console.log("sync : " + timeUsed);

var buf2 = rb.toBuffer();
var t2 = new Date().getTime();
RequestBroadcast.parse(buf2, function(_rb){
	var timeUsed2 = new Date().getTime() - t2;
	console.dir(_rb);
	console.log("async: " + timeUsed2);
});*/
