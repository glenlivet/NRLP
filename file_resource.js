/**
 * New node file
 */

var util 				= require('util'),
	fs					= require('fs'),
	Resource 			= require("./resource.js");

//file path, file extense, file descriptor, init callback
var _path, _ext, _fd, _initCallback;

var FileResource = module.exports = function(path, name){
	_path = path;
	_name = name || getFileName(path);
	
	//Resource.call(this, name, size);
};

util.inherits(FileResource, Resource);

/**
 * make the resource ready to be read.
 * @param initCb
 * 		the init callback method.
 */
FileResource.prototype.init = function(initCb){
	_initCallback = initCb;
	fs.open(_path, 'r', onFileOpen);
};

/**
 * get the file name from the full file path.
 * 
 * @param filePath
 * 		the full file path.
 */
var getFileName = function(filePath){
	//TODO
};

/**
 * file open call back.
 * 
 */
var onFileOpen = function(err, fd){
	//TODO
};