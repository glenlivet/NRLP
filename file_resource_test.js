
var FileResource = require('./file_resource.js');
var fs = require('fs');

var repo = [];

var r = new FileResource('pictest', '13.jpg');

var writable = fs.createWriteStream('resumable.jpg');

var speed = 1; //kb/s

r.addToRepository(repo, function(res){
	var chunkSize = speed * 1024;
	var timer = 0;
	
	(function loop(bytesSent){
		setTimeout(function(){
			
			timer = 1000;
			
			var bytesOut = bytesSent + chunkSize;
			
			if(r.size >= bytesOut){
				r.getBytes(bytesSent, chunkSize, function(err, bytesRead, buffer){
					writable.write(buffer);
					loop(bytesOut);
				});
			}else if(r.size < bytesOut){
				var shouldRead = r.size - bytesSent;
				r.getBytes(bytesSent, shouldRead, function(err, bytesRead, buffer){
					writable.end(buffer, function(){
						console.log('end');
					});
				});
			}
			
		}, timer);
	})(0);
	
	
});
