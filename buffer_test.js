/**
 * New node file
 */

var bops = require('bops');
var octets = [];

var t1 = new Date().getTime();
for(var i = 0; i < 150; i++){
	octets.push(i);
}
var buf = new Buffer(octets);
console.log(new Date().getTime() - t1);

octets = [];
var t2 = new Date().getTime();
for(var i = 0; i < 150; i++){
	var buf = new Buffer(1);
	buf.writeUInt8(i, 0);
	octets.push(buf);
}
var b = bops.join(octets);
console.log(new Date().getTime() - t2);