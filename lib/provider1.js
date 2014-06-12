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

var TALK_TIME = 4000;

var resources = {};

var transTasks = {};

var _clientId = 'Bingjue.Sun';

var TOPIC_NRLP_TALK = 'nrlp/talk/msg';
var TOPIC_NRLP_PROGRESS = 'nrlp/progress/percentage';

var TOPIC_REQUEST_BROADCAST = 'nrlp/res/req/broadcast';
var TOPIC_OFFICIAL_REQUEST = 'nrlp/res/req/listener/' + _clientId;
var TOPIC_OFFICIAL_RESPONSE = 'nrlp/res/resp/listener/';
// kb/s
var TRANSMISSION_SPEED = 3;

var DEFAULT_TCP_PORT = 10122;
var RESOURCE_TCP_LOCATION = '10.253.44.235' + ':' + DEFAULT_TCP_PORT;

/**
 * when connected to mqtt broker
 */
var onMqttConnected = function() {
	var topics = [ TOPIC_REQUEST_BROADCAST, TOPIC_OFFICIAL_REQUEST ];
	this.subscribe(topics, function(err, granted) {
		if (err) {
			console.error('Error occured during subscription!');
			console.error(err);
			return;
		}
		console.log('Successfully subscribed following topics: ');
		for ( var tq in granted) {
			console.log('	Topic: ' + granted[tq].topic + ' qos: '
					+ granted[tq].qos);
		}
		console.log('------------------------------------------');
	});
};

/**
 * When message arrived
 * 
 * @param topic
 *            MQTT topic.
 * @param message
 *            MQTT payload.
 */
var onMqttMessageArrived = function(topic, message, packet) {

	if (topic === TOPIC_REQUEST_BROADCAST) {
		onRequestBroadcastArrived.call(this, message);
	} else if (topic === TOPIC_OFFICIAL_REQUEST) {
		onOfficialRequestArrived.call(this, message);
	} else {
		console.warn('Unexpected MQTT message received. topic: ' + topic);
	}
};

var json = {
	clientId : _clientId,
	msg : 'Sorry guys, I gotta go!'
};

var jsonStr = JSON.stringify(json);

var mqttClient = mqtt.createClient(1883, 'localhost', {
	clientId : _clientId,
	encoding : 'binary',
	will: {
		topic : TOPIC_NRLP_TALK,
		payload : jsonStr
	}
});

mqttClient.on('connect', onMqttConnected.bind(mqttClient));

mqttClient.on('message', onMqttMessageArrived.bind(mqttClient));

var jpg = new FileResource("test", "../13.jpg");
jpg.addToRepository(resources);

var jpg2 = new FileResource("Desert", "../Desert.jpg");
jpg2.addToRepository(resources);


/**
 * ���յ� ����㲥
 * 
 * @param block
 *            ����㲥buffer
 */
var onRequestBroadcastArrived = function(block) {
	try {
		parser.parse(block, function(requestBroadcast) {
			console.dir(requestBroadcast);
			handleRequestBroadcast.call(this, requestBroadcast);
		});

	} catch (err) {
		console.error('Error occured when parsing a request broadcast!');
		console.error(err);
	}
};

var handleRequestBroadcast = function(reqBc) {
	console.log('handle request broadcast from ' + reqBc.requesterId);
	// validate the request
	var rtnCode = validateRequestBroadcast(reqBc);
	if (rtnCode == 200) {
	
		// find the resource
		var res = findResourceByResquest(reqBc);
		// build the proposal provision
		var ppBuf = generator.buildProposalProvisionBuffer(reqBc.requestCode,
				res, _clientId, reqBc.transTypeRequirement, TRANSMISSION_SPEED);
	setTimeout(function(){			
		sendMessage(TOPIC_OFFICIAL_RESPONSE + reqBc.requesterId, ppBuf);
		
		//发送信息
		var msg = 'Hi ' + reqBc.requesterId + ', I get what you need!';
		sendNotifyMessage(TOPIC_NRLP_TALK, msg);
		}, TALK_TIME);
	}
};

var sendNotifyMessage = function(topic, _msg){
	var pack = {
		clientId : _clientId,
		msg : _msg
	};
	var str = JSON.stringify(pack);
	mqttClient.publish(topic, new Buffer(str), 2);
};

var findResourceByResquest = function(reqBc) {
	var resName = reqBc.requestedResourceName;
	return resources[resName];
};

/**
 * ���յ� ��Դ����
 * 
 * @param block
 */
var onOfficialRequestArrived = function(block) {
	try {
		parser.parse(block, function(officialRequest) {
			
			handleOfficialRequest.call(this, officialRequest);
		});

	} catch (err) {
		console.error('Error occured when parsing a request broadcast!');
		console.error(err);
	}
};

var handleOfficialRequest = function(officialRequest) {
	console.log("handling the official request from "
			+ officialRequest.requesterId);
	// do validation if needed
	// build official response
	// get a transmission code
	var transCode = getAvailableTransmissionCode();
	var _res = resources[officialRequest.resourceName];
	// //////////////////////////////////////////////////////////////////
	var transTask = {
		code : transCode,
		requesterId : officialRequest.requesterId,
		requestCode : officialRequest.requestCode,
		resource : _res,
		transmissionType : officialRequest.transmissionType,
		transfered : 0
	};
	// //////////////////////////////////////////////////////////////////
	transTasks[transTask.code] = transTask;
	var officialRespBuff = generator.buildOfficialResponseBuffer(transTask,
			_clientId, RESOURCE_TCP_LOCATION);
	setTimeout(function(){
	sendMessage(TOPIC_OFFICIAL_RESPONSE + transTask.requesterId,
			officialRespBuff);
	var msg = 'Ok. I get you the location of the resource, help yourself!';
	sendNotifyMessage(TOPIC_NRLP_TALK, msg);
	}, TALK_TIME);

};

/**
 * 
 * 
 */
var validateRequestBroadcast = function(reqBc) {
	var resName = reqBc.requestedResourceName;
	var transType = reqBc.transTypeRequirement;

	if (typeof resources[resName] !== 'undefined') {
		// console.dir(resources[resName]);
		var foundTransType = resources[resName].supportTransType
				.indexOf(transType) >= 0 ? true : false;
		if (foundTransType)

			return 200;
	}
	return 404;
};

var sendMessage = function(topic, payload) {
	mqttClient.publish(topic, payload);

};

/**
 * TODO get an available transmission code.
 */
var getAvailableTransmissionCode = function() {
	return 0;
};

var tcpClients = {};

var tcpServer = null;

var startTcpServer = function(port) {
	tcpServer = net.createServer(function(c) {
		console.log('tcp server started!');

		c.on('data', function(buf) {

			console.log('data from tcp');
			console.log('bytes received: ' + c.bytesRead);
			console.log('data size: ' + buf.length);

			if (typeof c.readingStage !== 'undefined' && c.readingStage == 3) {
				// reading params
				readTransmissionRequestParams(c, buf);
			} else if (typeof c.readingStage !== 'undefined'
					&& c.readingStage == 2) {
				// reading remain length
				readTransReqRemainLength(c, buf);
			} else if (typeof c.readingStage !== 'undefined'
					&& c.readingStage == 1) {
				// reading transCode
				readTransmissionCode(c, buf);
			} else if (typeof c.readingStage === 'undefined'
					|| c.readingStage == 0) {
				// reading head
				readTransmissionRequestHead(c, buf);
			}
			// ////////////////////////////////////////////////

		});
		
//		c.on('close', function(){
//			console.log('close');
//		});
	});
	tcpServer.listen(port, function() { // 'listening' listener
		console.log('tcpserver bound');
	});

};

startTcpServer(DEFAULT_TCP_PORT);

/**
 * reading the head
 */
var readTransmissionRequestHead = function(c, buf) {
	if (typeof c.readingStage === 'undefined') {
		c.readingStage = 0;
	}
	if (typeof c.transReqHeadOctets === 'undefined') {
		c.transReqHeadOctets = [];
	}
	for ( var i = 0; i < buf.length; i++) {
		var digit = buf[i];
		c.transReqHeadOctets.push(digit);
		if (c.transReqHeadOctets.length === 8) {
			// done
			var head = new Buffer(c.transReqHeadOctets);
			var rtnVal = protocol_head.validateProtocolHead(head);
			if (rtnVal === protocol_head.PROTOCOL_TRANSMISSION_REQUEST) {
				c.readingStage = 1;
				var rest = buf.slice(i + 1);
				readTransmissionCode(c, rest);
			} else {
				console
						.error('protocol error when reading transmission request head!');
				c.end();
			}

			break;
		}
	}
};

/**
 * reading transmission code
 */
var readTransmissionCode = function(c, buf) {
	if (typeof c.transCodeOctets === 'undefined') {
		c.transCodeOctets = [];
	}
	for ( var i = 0; i < buf.length; i++) {
		var digit = buf[i];
		c.transCodeOctets.push(digit);
		if (c.transCodeOctets.length == 2) {
			// done
			c.transCode = new Buffer(c.transCodeOctets).readUInt16BE(0);
			// save socket client in clients
			tcpClients[c.transCode] = c;
			var rest = buf.slice(i + 1);
			c.readingStage = 2;
			readTransReqRemainLength(c, rest);
			break;
		}
	}

};

/**
 * reading the remain length
 */
var readTransReqRemainLength = function(c, buf) {
	var task = transTasks[c.transCode];
	if (typeof c.remLenOctets === 'undefined') {
		c.remLenOctets = [];
	}
	for ( var i = 0; i < buf.length; i++) {
		var digit = buf[i];
		if ((digit & 0x80) === 0) {
			// end of remain length
			c.remLenOctets.push(digit);
			var remLenBuf = new Buffer(c.remLenOctets);
			c.remainLength = io_util.readMultiByteIntegerSync(remLenBuf);
			console.log("remain length in transmission request: "
					+ c.remainLength);
			c.readingStage = 3;
			var rest = buf.slice(i + 1);
			readTransmissionRequestParams(c, rest);
			break;
		} else {
			c.remLenOctets.push(digit);
			continue;
		}
	}
};

/**
 * 
 */
var readTransmissionRequestParams = function(c, buf) {
	var task = transTasks[c.transCode];
	if (typeof task.parameters === 'undefined') {
		task.parameters = new Buffer(0);
	}
	task.parameters = bops.join([ task.parameters, buf ]);
	if (task.parameters.length > c.remainLength) {
		// TODO
		console
				.error('reading transmission request params error, larger than remain length!');
	} else if (task.parameters.length === c.remainLength) {
		handleTransmissionRequestWithParams(task);
	} else {
		// not enough data
		return;
	}

};

/**
 * 处理传输请求
 * 
 * @task the transmission task
 * @buf the params buffer
 */
var handleTransmissionRequestWithParams = function(task) {
	//
	console.log('handleTransmissionRequestWithParams');
	console.log(task.parameters.length);
//	console.dir(task);
	// 开始传输
	// tcp client
	var c = tcpClients[task.code];
	var finalRespHeadBuf = protocol_head
			.getProtocolHead(protocol_head.PROTOCOL_FINAL_RESPONSE);
	// 写头
	c.write(finalRespHeadBuf);
	// 写requestCode
	var requestCodeBuf = new Buffer(2);
	requestCodeBuf.writeUInt16BE(task.requestCode, 0);
	c.write(requestCodeBuf);
	// 写结果
	var result = new Buffer(1);
	result.writeUInt8(1, 0);
	c.write(result);
	var remLengthBuf = io_util.writeMultiByteInteger(task.resource.size);
	c.write(remLengthBuf);
	console.log("socket wrote: " + c.bytesWritten);
	var offset = 0;
	console.dir(task);
	console.log('task TransType: ' + task.transmissionType);
	var paramsBuf = task.parameters;
	for(var i=0; i< paramsBuf.length;i++){
		console.log('handleTransmissionRequestWithParams: received request' + i + ' : ' + paramsBuf[i]);
	}
	if (task.transmissionType === 1) {
		offset = getOffsetFromParams(task.parameters);
//		console.log('~~~~~~~~offset: ' + offset);
	}
//	console.log('从｀｀｀offset ' + offset);
	setTimeout(function(){
	resumableTransfer(task.resource.fd, c, task.resource.size, offset);
	}, TALK_TIME);
};

var getOffsetFromParams = function(buf) {
	return io_util.readMultiByteIntegerSync(buf);
};

var resumableTransfer = function(fd, c, fileSize, offset) {

	var msg = 'Now start transmission from offset ' + offset + '!';
	sendNotifyMessage(TOPIC_NRLP_TALK, msg);

	var chunkSize = TRANSMISSION_SPEED * 1024;
	var timer = 0;

	(function loop(bytesSent) {
		setTimeout(function() {
			timer = 1000;
			// the bytes out after this time
			var bytesOut = bytesSent + chunkSize;
			//
			if (fileSize >= bytesOut) {

				fs.read(fd, new Buffer(chunkSize), 0, chunkSize, bytesSent,
						function(err, bytesRead, buffer) {
							c.write(buffer);
							console.log('111111');
							loop(bytesOut);
						});
			} else if (fileSize < bytesOut) {
				var shouldRead = fileSize - bytesSent;

				fs.read(fd, new Buffer(shouldRead), 0, shouldRead, bytesSent,
						function(err, bytesRead, buffer) {
							c.write(buffer, function() {

								c.end();
							});

							return;
						});
			}

		}, timer);

	})(offset);

};