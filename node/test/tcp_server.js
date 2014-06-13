

var net         = require('net'),
    fs          = require('fs');

var FILE        = '13.jpg';

var SPEED       = 1; //kb/s

var tcpServer   = null;

fs.open(FILE, 'r', function(err, fd){

    var stats = fs.fstatSync(fd);
    var fileSize = stats.size;
    console.log('filesize: ' + fileSize);
    
    tcpServer = net.createServer(function(c){
            console.log('tcp server connected!');

            c.on('end', function() {
                console.log('server disconnected');
            });
            
            transfer(fd, c, fileSize);
            //c.end('123');
            

        });


    tcpServer.listen(8124);
    

});


var transfer = function(fd, c, fileSize){
    
    var chunkSize = SPEED * 1024;
    var timer = 0;

    (function loop(bytesSent){
        setTimeout(function(){
            timer = 1000;
         //the bytes out after this time
         var bytesOut = bytesSent + chunkSize;
         //
         if(fileSize >= bytesOut){
            
            fs.read(fd, new Buffer(chunkSize), 0, chunkSize, bytesSent, function(err, bytesRead, buffer){
                c.write(buffer);
                loop(bytesOut);
            });       
         }else if(fileSize < bytesOut){
            var shouldRead = fileSize - bytesSent;
            fs.read(fd, new Buffer(shouldRead), 0 , shouldRead, bytesSent, function(err, bytesRead, buffer){
               c.write(buffer,function(){
                   
                    c.end();
                   });
               
               return; 
            });        
         }

        }, timer);
            
    })(0);
      
    
};


