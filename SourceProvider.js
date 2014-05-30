/**
 * New node file
 */

var net 		= require('net'),
	util 		= require('util'),
	events 		= require('events');

var DEFAULT_OPTS = {
		port : 10909,			//server port
		host : null,			//server host
		timeout : 30000,		//connection timeout
		speed : 20				//transmission speed kb/s
};

var resources = {};

var missions = {};

var port, host, timeout, speed;

var SourceProvider = module.exports = function SourceProvider(opts){
	if(!opts){
		opts = DEFAULT_OPTS;
	}
	
	port = opts.port;
	
	host = opts.host;
	
	timeout = opts.timeout;
	
	speed = opts.speed;
	
	//inherit net.Server
	net.Server.call(this);
	
};

util.inherits(SourceProvider, net.Server);

/**
 * start
 */
SourceProvider.prototype.service = function(){

	if(host === null){
		this.listen(port);
	}else {
		this.listen(port, host);
	}
};


