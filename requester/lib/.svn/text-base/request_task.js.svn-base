/**
 * New node file
 */

var util = require("util");
var events = require("events");

var STATE_LOOKUP = 0;
var STATE_ENGAGED = 1;
var STATE_COMPLETE = 2;

var RequestTask = module.exports = function RequestTask(code, resource, transType, timeout){
	this.code = code;
	this.resourceName = resource.name;
	this.resourceType = resource.type;
	this.state = STATE_LOOKUP;
	//received data length
	this.received = 0;
	this.transmissionType = transType;
	this.timeout = timeout || 15000;
	this.timeoutCallback = null;
	events.EventEmitter.call(this);
};

util.inherits(RequestTask, events.EventEmitter);

RequestTask.prototype.begin = function(){
	
	this.timeoutCallback = setTimeout(onTimeout.bind(this), this.timeout);
};

var onTimeout = function(){
	if(this.state === STATE_LOOKUP){
		this.emit('timeout', this.code);
	}
};

RequestTask.prototype.engaged = function(){
	clearTimeout(this.timeoutCallback);
	this.state = 1;
	
};

RequestTask.prototype.completed = function(){
	this.state = 2;
//	console.log(this.state + '~~~~~~~ ' + this.received);
	clearTimeout(this.timeoutCallback);
	
};

RequestTask.prototype.restart = function(){
	this.state = STATE_LOOKUP;
	this.begin();
};