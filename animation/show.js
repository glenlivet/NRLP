
var ResourceRequester = require('./lib/resource_requester.js');
var fs = require('fs');
var requster;

$(document).ready(function(){
	//requester
	initRequester();
	
	requester.on(ResourceRequester.EVENT_RESOURCE_READY, function(resource){
	console.log("total size: " + resource.data.length);
	var writable = fs.createWriteStream('../copy.jpg');
	writable.write(resource.data, function(){
		console.log('done');
		setTimeout(function(){
		$("#show_pic img").attr("src","../copy.jpg");
		
		}, 500);
	});
	
});

requester.on(ResourceRequester.EVENT_RESORUCE_NOT_FOUND, function(resource){
	
	console.warn("timeout : " + resource.name);
});
var size=0;
requester.on(ResourceRequester.EVENT_RESOURCE_HIT, function(resource){
	console.log('data received: ' + resource.partialData.length);
	size = eval(size+"+"+resource.partialData.length);
	var l = eval(size+"/"+resource.totalSize);
	var temp = Math.round(eval(l+"*"+100));
	$("#progress div").attr("aria-valuenow",temp);
	$("#progress div").attr("style","width:"+temp+"%");
	$("#progress span").html(temp+"%");
});

requester.init();
});

function initRequester(){
	requester = process.mainModule.exports.getResRequester();
}

function doSearch(){
	var resName = $('#resource').val();
	size = 0;
	var resource = {
			name : resName,
			type : 1
	};
	requester.lookup(resource, 1);
}





