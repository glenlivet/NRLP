

var writeUTF8 = function(string){
	var strLen = Buffer.byteLength(string);
	var buf = new Buffer(strLen + 2);
	//写入string的比特长
	buf.writeUInt16BE(strLen, 0);
	buf.write(string, 2);
	return buf;
};

module.exports.writeUTF8 = writeUTF8;

// var buf = writeUTF8('NSLP');

// for(var i = 0 ; i < buf.length; i++){
	// console.log(buf[i]);
// }