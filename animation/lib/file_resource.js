/**
 * New node file
 */

var util 				= require('util'),
	protocol			= require('./protocol.js'),
	fs					= require('fs');
	
	
var FileResource = module.exports = function FileResource(resName, filePath){
	
	this.name = resName;
	
	this.path = filePath;
	
	this.type = protocol.PROTOCOL_RESTYPE_FILE;
	
	this.supportTransType = [];
	
	this.size = null;
	
	this.fd = null;
	
	this.available = false;

};

/**
 * add the resource to the resource repository.
 * @repo	the resource repository
 * @supportTransType	an array of supported transmission type
 * @cb	the callback when it is read
 */
FileResource.prototype.addToRepository = function(repo, supportTransType, cb){
	var that = this;
	fs.open(this.path, 'r', function(err, fd){
		if(err){
			console.error(that.name + ' failed to be added to the resource repository. Caused by: ' + err);
			return;
		}
		that.size = fs.fstatSync(fd).size;
		that.fd = fd;
		if(typeof supportTransType === 'function'){
			cb = supportTransType;
			supportTransType = null;
		}
		that.supportTransType = supportTransType || [protocol.PROTOCOL_TRANSTYPE_RETRYABLE, protocol.PROTOCOL_TRANSTYPE_ONESHOT];
		that.available = true;
		repo[that.name] = that;
		if(typeof cb !== 'undefined'){
			cb(that);
		}
	});
};

/**
 * fetch all the bytes of the file
 * @param cb	the call back with two params(err and data)
 */
FileResource.prototype.getTotalBytes = function(cb){
	fs.readFile(this.path, cb);
};


/**
 * fetch part of the file in bytes.
 * @param offset	the starting point
 * @param size 	the size of bytes to be fetched
 * @param cb	the callback when data is ready. three params are provided: err, bytesRead and the buffer.
 */
FileResource.prototype.getBytes = function(offset, size, cb){
	var that = this;
	fs.read(this.fd, new Buffer(size), 0, size, offset, cb);
};