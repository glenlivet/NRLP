/**
 * New node file
 */

var ResourceRequester = require('../lib/resource_requester.js');
var fs = require('fs');

var opts = {
		clientId : 'Shulai.Zhang'
};

var resRequester = new ResourceRequester(opts);

var doRequest = function(){
	var resource = {
			name : 'German',
			type : 1
	};
	resRequester.lookup(resource, 1);
	
};

resRequester.on(ResourceRequester.EVENT_RESOURCE_READY, function(resource){
	console.log("total size: " + resource.totalSize);
//	var writable = fs.createWriteStream('../copy.jpg');
//	writable.write(resource.data, function(){
//		console.log('done');
//	});
	
});

resRequester.on(ResourceRequester.EVENT_RESORUCE_NOT_FOUND, function(resource){
	
	console.warn("timeout : " + resource.name);
});

resRequester.on(ResourceRequester.EVENT_RESOURCE_HIT, function(resource){
	console.log('data received: ' + resource.partialData.length);
});

resRequester.init(doRequest);