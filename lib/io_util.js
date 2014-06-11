

var writeUTF8 = function(string){
	var strLen = Buffer.byteLength(string);
	var buf = new Buffer(strLen + 2);
	// write the byte length of the string
	buf.writeUInt16BE(strLen, 0);
	buf.write(string, 2);
	return buf;
};

var readUTF8Sync = function(block){
	//the 2 BE bytes indicating the length of string
	var len = block.readUInt16BE(0);
	//encoded string
	if(2 + len > block.length){
		throw new Error('The current buffer is not sufficient to be decoded!');
	}
	var contentBytes = block.slice(2, 2 + len);
	//decode it
	return contentBytes.toString();
	
};

var readUTF8 = function(block, cb){
	//the 2 BE bytes indicating the length of string
	var len = block.readUInt16BE(0);
	//encoded string
	if(2 + len > block.length){
		throw new Error('The current buffer is not sufficient to be decoded!');
	}
	var contentBytes = block.slice(2, 2+len);
	//the rest block
	var rest = block.slice(2+len, block.length);
	cb(contentBytes.toString(), rest);
};

/**
 * drop first utf8 and return the rest buffer.
 * @param block	the buffer block
 * @return the rest of the buffer
 */
var dropFirstUTF8 = function(block){
	
	//the length of string
	var len = block.readUInt16BE(0);
	//encoded string
	if(2 + len > block.length){
		throw new Error('The current buffer is not sufficient to be decoded!');
	}
	var rest = block.slice(2 + len, block.length);
	return rest;
	
};

/* Requires length be a number > 0 */
var writeMultiByteInteger = function(length) {
  if(typeof length !== "number") return null;
  if(length < 0) return null;
  if(length = 0) return new Buffer(0);
  var len = []
    , digit = 0;
  
  do {
    digit = length % 128 | 0;
    length = length / 128 | 0;
    if (length > 0) {
        digit = digit | 0x80;
    }
    len.push(digit);
  } while (length > 0);
  
  return new Buffer(len);
};

var readMultiByteInteger = function(block, cb){
	var multiplier = 1;
	var value = 0;
	var bytesRead = 0;
	do{
		var digit = block.readUInt8(bytesRead, ++bytesRead);
		value += (digit & 127) * multiplier;
		multiplier *= 128;
	}while((digit & 128) != 0);
	var rest = block.slice(bytesRead);
	cb(value, rest);
};

/**
 * 
 *
 */
var readMultiByteIntegerSync = function(block){
	var multiplier = 1;
	var value = 0;
	var bytesRead = 0;
	do{
		var digit = block.readUInt8(bytesRead, ++bytesRead);
		value += (digit & 127) * multiplier;
		multiplier *= 128;
	}while((digit & 128) != 0);
	
	return value;
	
};

module.exports.writeUTF8 = writeUTF8;
module.exports.readUTF8 = readUTF8;
module.exports.dropFirstUTF8 = dropFirstUTF8;
module.exports.readUTF8Sync = readUTF8Sync;
module.exports.writeMultiByteInteger = writeMultiByteInteger;
module.exports.readMultiByteInteger = readMultiByteInteger;
module.exports.readMultiByteIntegerSync = readMultiByteIntegerSync;