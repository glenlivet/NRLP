
var mqtt = require('mqtt');
var parser = require('./parser.js');
var generator = require('./generator.js');
var FileResource = require('./file_resource.js');
var protocol_head = require('./protocol_head.js');
var protocol = require('./protocol.js');
var net = require('net');
var io_util = require('./io_util.js');
var bops = require('bops');
var fs = require('fs');

var resources = {};

var transTasks = {};

var _clientId = 'res-provider-' + Math.floor(Math.random()*100);

var TOPIC_REQUEST_BROADCAST = 'nrlp/res/req/broadcast';
var TOPIC_OFFICIAL_REQUEST  = 'nrlp/res/req/listener/' + _clientId;
var TOPIC_OFFICIAL_RESPONSE = 'nrlp/res/resp/listener/';
//kb/s
var TRANSMISSION_SPEED = 1;

var RESOURCE_TCP_LOCATION = 'localhost:10177';

/**
 * when connected to mqtt broker
 */
var onMqttConnected = function(){
	var topics = [TOPIC_REQUEST_BROADCAST, TOPIC_OFFICIAL_REQUEST];
	this.subscribe(topics, function(err, granted){
		if(err){
			console.error('Error occured during subscription!');
			console.error(err);
			return;
		} 
		console.log('Successfully subscribed following topics: ');
		for(var tq in granted){
			console.log('	Topic: ' + granted[tq].topic + ' qos: ' + granted[tq].qos);
		}
		console.log('------------------------------------------');
	});
};

/**
 * When message arrived
 * @param topic MQTT topic.
 * @param message MQTT payload.
 */
var onMqttMessageArrived = function(topic, message, packet){
	
	if(topic === TOPIC_REQUEST_BROADCAST){
		onRequestBroadcastArrived.call(this, message);
	}else if(topic === TOPIC_OFFICIAL_REQUEST){
		onOfficialRequestArrived.call(this, message);
	}else {
		console.warn('Unexpected MQTT message received. topic: ' + topic);
	}
};

var mqttClient = mqtt.createClient(1883, 'localhost', {clientId : _clientId, encoding:'binary'});

mqttClient.on('connect', onMqttConnected.bind(mqttClient));

mqttClient.on('message', onMqttMessageArrived.bind(mqttClient));

var jpg = new FileResource("testResName", "../13.jpg");
jpg.addToRepository(resources);

/**
 * ���յ� ����㲥
 * @param block ����㲥buffer
 */
var onRequestBroadcastArrived = function(block){
	try{
		parser.parse(block, function(requestBroadcast){
			console.dir(requestBroadcast);
			handleRequestBroadcast.call(this, requestBroadcast);
		});
		
	}catch(err){
		console.error('Error occured when parsing a request broadcast!');
		console.error(err);
	}
};

var handleRequestBroadcast = function(reqBc){
	console.log('handle request broadcast from ' + reqBc.requesterId);
	//validate the request 
	var rtnCode = validateRequestBroadcast(reqBc);
	if(rtnCode == 200){
		// find the resource
		var res = findResourceByResquest(reqBc);
		// build the proposal provision
		var ppBuf = generator.buildProposalProvisionBuffer(reqBc.requestCode, res, _clientId, reqBc.transTypeRequirement, TRANSMISSION_SPEED);
		sendMessage(TOPIC_OFFICIAL_RESPONSE + reqBc.requesterId, ppBuf);
	}
};

var findResourceByResquest = function(reqBc){
	var resName = reqBc.requestedResourceName;
	return resources[resName];
};

/**
 * ���յ� ��Դ����
 * @param block 
 */
var onOfficialRequestArrived = function(block){
	try{
		parser.parse(block, function(officialRequest){
			//console.dir(officialRequest);
			handleOfficialRequest.call(this, officialRequest);
		});
		
	}catch(err){
		console.error('Error occured when parsing a request broadcast!');
		console.error(err);
	}
};

var handleOfficialRequest = function(officialRequest){
	console.log("handling the official request from " + officialRequest.requesterId);
	//TODO
	//do validation if needed
	//build official response
	//get a transmission code
	var transCode = getAvailableTransmissionCode();
	var _res = resources[officialRequest.resourceName];
	var transTask = {
		code : transCode,
		requesterId : officialRequest.requesterId,
		requestCode : officialRequest.requestCode,
		resource : _res,
		transmssionType : officialRequest.transmissionType,
		transfered : 0
	};
	transTasks[transTask.code] = transTask;
	var officialRespBuff = generator.buildOfficialResponseBuffer(transTask, _clientId, RESOURCE_TCP_LOCATION);
	sendMessage(TOPIC_OFFICIAL_RESPONSE + transTask.requesterId, officialRespBuff);
	
};

/**
 * 
 * 
 */
var validateRequestBroadcast = function(reqBc){
	var resName = reqBc.requestedResourceName;
	var transType = reqBc.transTypeRequirement;
	
	
	if(typeof resources[resName] !== 'undefined'){
		//console.dir(resources[resName]);
		var foundTransType = resources[resName].supportTransType.indexOf(transType) >= 0 ? true : false;
		if(foundTransType)
			
			return 200;
	}
	return 404;
};

var sendMessage = function(topic, payload){
	mqttClient.publish(topic, payload);
	
};

/**
 * TODO
 * get an available transmission code.
 */
var getAvailableTransmissionCode = function(){
	return 0;
};

var tcpClients = {};

var tcpServer = null;

var startTcpServer = function(port){
	tcpServer = net.createServer(function(c){
		console.log('tcp server started!');
		
		c.on('data', function(buf){
			if(typeof c.receivedData === 'undefined'){
				c.receivedData = new Buffer(0);
				c.readingStage = 0;
			}
			//readingStage 0: reading head 1: reading transCode 2: reading length 3: reading params 4: finished
			
			//get the received data
			c.receivedData = bops.join([c.receivedData, buf]);
			//if protocol head is received do as defined
			//else close it.
			if(c.receivedData.length >= 8 && c.readingStage === 0){
				var head = protocol_head.validateProtocolHead(c.receivedData);
				if(head !== protocol_head.PROTOCOL_TRANSMISSION_REQUEST){
					c.end();
				}else {
					c.readingStage = 1;
					//it is a transmission request
					console.log('a transmission request');
					//remove head
					c.receivedData = c.receivedData.slice(8);
					if(c.receivedData.length >= 2){
						//read the transCode
						c.transCode = c.receivedData.readUInt16BE(0);
						// remove this bytes
						c.receivedData = c.receivedData.slice(2);
						// save client obj 
						tcpClients[c.transCode] = c;
						c.readingStage = 2;
						// read the length
						for(var i=0; i<c.receivedData.length; i++){
							var digit = c.receivedData.readUInt8(i, i+1);
							if((digit & 0x80) == 0){
								var buf = c.receivedData.slice(0, i+1);
								
								c.remainLength = io_util.readMultiByteIntegerSync(buf);
								c.receivedData = c.receivedData.slice(i+1);
								c.readingStage = 3;
								break;
							}
						}
						
						// read the param
						if(c.readingStage == 3){
							if(c.receivedData.length < c.remainLength){
								//not enough data for params
								return;
							}else {
								handleTransmissionRequestWithParams(transTasks[c.transCode], c.receivedData);
							}
						}else {
							//not enough data for remain length
							return;
						}
						////////
					}else {
						//not enough data for transmissino code
						return;
					}
				}
			}else if(c.readingStage === 1 && c.receivedData >= 2){
				//read transCode
				c.transCode = c.receivedData.readUInt16BE(0);
						// remove this bytes
						c.receivedData = c.receivedData.slice(2);
						// save client obj 
						tcpClients[c.transCode] = c;
						c.readingStage = 2;
						// read the length
						for(var i=0; i<c.receivedData.length; i++){
							var digit = c.receivedData.readUInt8(i, i+1);
							if((digit & 0x80) == 0){
								var buf = c.receivedData.slice(0, i+1);
								
								c.remainLength = io_util.readMultiByteIntegerSync(buf);
								c.receivedData = c.receivedData.slice(i+1);
								c.readingStage = 3;
								break;
							}
						}
						
						// read the param
						if(c.readingStage == 3){
							if(c.receivedData.length < c.remainLength){
								//not enough data for params
								return;
							}else {
								handleTransmissionRequestWithParams(transTasks[c.transCode], c.receivedData);
							}
						}else {
							//not enough data for remain length
							return;
						}
			}else if(c.readingStage === 2){
				// read the length
				for(var i=0; i<c.receivedData.length; i++){
							var digit = c.receivedData.readUInt8(i, i+1);
							if((digit & 0x80) == 0){
								var buf = c.receivedData.slice(0, i+1);
								
								c.remainLength = io_util.readMultiByteIntegerSync(buf);
								c.receivedData = c.receivedData.slice(i+1);
								c.readingStage = 3;
								break;
							}
						}
						
						// read the param
						if(c.readingStage == 3){
							if(c.receivedData.length < c.remainLength){
								//not enough data for params
								return;
							}else {
								handleTransmissionRequestWithParams(transTasks[c.transCode], c.receivedData);
							}
						}else {
							//not enough data for remain length
							return;
						}
			} else if(c.readingStage == 3 && c.receivedData.length >= c.remainLength){
				handleTransmissionRequestWithParams(transTasks[c.transCode], c.receivedData);
			}
		});
	});
	tcpServer.listen(port, function() { //'listening' listener
		console.log('tcpserver bound');
	});
	
};

startTcpServer(10177);

/**	
 * 处理传输请求 
 * @task	the transmission task
 * @buf		the params buffer
 */
var handleTransmissionRequestWithParams = function(task, buf){
	//
	console.log('handleTransmissionRequestWithParams');
	console.dir(task);
	//开始传输
	//tcp client 
	var c = tcpClients[task.code];
	var finalRespHeadBuf = protocol_head.getProtocolHead(
			protocol_head.PROTOCOL_FINAL_RESPONSE);
	//写头
	c.write(finalRespHeadBuf);
	//写结果
	var result = new Buffer(1);
	result.writeUInt8(1, 0);
	c.write(result);
	var remLengthBuf = io_util.writeMultiByteInteger(task.resource.size);
	c.write(remLengthBuf);
	var offset =  getOffsetFromParams(buf);
	resumableTransfer(task.resource.fd, c, task.resource.size, offset);
};

var getOffsetFromParams = function(buf){
	return 0;
};

var resumableTransfer = function(fd, c, fileSize, offset){
    
    var chunkSize = TRANSMISSION_SPEED * 1024;
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
            
    })(offset);
      
    
};