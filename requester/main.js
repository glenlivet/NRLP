/**
 * New node file
 */

var ResourceRequester = require('./lib/resource_requester.js');
var fs = require('fs');

var opts = {
		clientId : 'Shulai.Zhang',
		host : '10.253.44.235'
};

var resRequester = new ResourceRequester(opts);

exports.getResRequester = function(){

	return resRequester;
};

// var doRequest = function(){
	// var resource = {
			// name : 'testResName',
			// type : 1
	// };
	// resRequester.lookup(resource, 1);
	
// };
// resRequester.on(ResourceRequester.EVENT_RESOURCE_READY, function(resource){
	// console.log("total size: " + resource.data.length);
	// var writable = fs.createWriteStream('../copy.jpg');
	// writable.write(resource.data, function(){
		// console.log('done');
	// });
	// $("#show_pic").attr("src","../copy.jpg");
// });

// resRequester.on(ResourceRequester.EVENT_RESORUCE_NOT_FOUND, function(resource){
	
	// console.warn("timeout : " + resource.name);
// });

// resRequester.on(ResourceRequester.EVENT_RESOURCE_HIT, function(resource){
	// console.log('data received: ' + resource.partialData.length);
	// var l = eval(resource.partialData.length+"/"+resource.totalSize);
	// var temp = Math.round(eval(l+"*"+100));
	// $("#progress div").attr("aria-valuenow",temp);
	// $("#progress div").attr("style","width:"+temp+"%");
	// $("#progress span").html(temp+"%");
// });

// resRequester.init(doRequest);