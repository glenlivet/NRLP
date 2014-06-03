

var net  = require('net');

var fs   = require('fs');

var writable = fs.createWriteStream('copy.jpg');


var finished = false;

writable.on('drain', function(){
    console.log('~~~~~~');
    if(finished){
        var timeStr = new Date().toLocaleTimeString();
        console.log(timeStr + ' transfer finished!');
  
    }    
});


var client = net.connect({port : 8124}, function(){
    
    console.log('client connected!');
    
        
}); 

client.on('data', function(data){
     writable.write(data);
     var timeStr = new Date().toLocaleTimeString();
     console.log(timeStr + ' data received : ' + data.length + ' bytes.');
    
});


client.on('end', function(){

    finished = true; 
    console.log('client disconnected!');   
});

client.on('error', function(){
   console.log('err'); 
});

client.on('close', function(){
    console.log('close');    
});
