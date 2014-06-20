/**
 * New node file
 */

var _name, _size;			//unique name, resource size in byte

/**
 * Constructor
 */
var Resource = module.exports = Resource(name, size){
	_name = name;
	_size = size;
	
};

Resource.TYPE_PROTOTYPE = 0;
Resource.TYPE_FILE      = 1;

/**
 * @return the size of resource in byte.
 */
Resource.prototype.getSize = function(){
	//TODO
	return _size; 
};

/**
 * get part of resource.
 * @param start	
 * 		the start offset.
 * @param quantity
 * 		the quantity asked.
 * @return buffer
 * 		the buffer with asked quantity or the rest of resource if the ending is hit.
 */
Resource.prototype.getBytes = function(start, quantity){
	//TODO
	return new Buffer(quantity);
};

/**
 * @return the resource type.
 */
Resource.prototype.getType = function(){
	//TODO
	return Resource.TYPE_PROTOTYPE;
};


/**
 * @return the resource unique name.
 */
Resource.prototype.getName = function(){
	return _name;
};