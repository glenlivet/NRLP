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
var CodeGenerator = require('./code_generator.js');

var TALK_TIME = 5000;

var DEFAULT_CLIENTID_PREFIX = 'res-provider-';

var DEFAULT_TCP_PORT = 10177;
var DEFAULT_TCP_HOST = 'localhost';
// kb/s
var DEFAULT_TRANSMISSION_SPEED = 5;

var TOPIC_NRLP_TALK = 'nrlp/talk/msg';
var TOPIC_NRLP_PROGRESS = 'nrlp/progress/percentage';

var TOPIC_REQUEST_BROADCAST = 'nrlp/res/req/broadcast';
var TOPIC_OFFICIAL_REQUEST_PREFIX = 'nrlp/res/req/listener/';
var TOPIC_OFFICIAL_RESPONSE = 'nrlp/res/resp/listener/';

var ResourceProvider = module.exports = function ResourceProvider(opts){
	this.clientId = opts.clientId || DEFAULT_CLIENTID_PREFIX + Math.floor(Math.random() * 100);
	this.resources = {};
	this.transTasks = {};
	this.tcpLocation = opts.tcpLocation || DEFAULT_TCP_HOST + ':' + DEFAULT_TCP_PORT;
	this.transmissionSpeed = opts.transmissionSpeed || DEFAULT_TRANSMISSION_SPEED;
	this.topicOfficialRequestListening = TOPIC_OFFICIAL_REQUEST_PREFIX + opts.clientId;
	this.opts = opts;
	this.transCodeGenerator = new CodeGenerator();
};

/**
 * when connected to mqtt broker
 */
var onMqttConnected = function() {
	var topics = [ TOPIC_REQUEST_BROADCAST, this.topicOfficialRequestListening ];
	this.mqttClient.subscribe(topics, function(err, granted) {
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
	} else if (topic === this.topicOfficialRequestListening) {
		onOfficialRequestArrived.call(this, message);
	} else {
		console.warn('Unexpected MQTT message received. topic: ' + topic);
	}
};

ResourceProvider.prototype.init = function(){

	var json = {
		clientId : this.clientId,
		msg : 'Sorry guys, I gotta go!'
	};

	var jsonStr = JSON.stringify(json);
	
	this.mqttClient = mqtt.createClient(this.opts.mqttPort||1883, this.opts.mqttHost||'localhost', {
		clientId : this.clientId,
		encoding : 'binary',
		will: {
			topic : TOPIC_NRLP_TALK,
			payload : jsonStr
		}
	});
	
	this.mqttClient.on('connect', onMqttConnected.bind(this));
	this.mqttClient.on('message', onMqttMessageArrived.bind(this));
	
	this.tcpClients = {};
	this.tcpServer = null;
	var tcpPort = null;
	try{
		tcpPort = this.tcpLocation.split(':')[1].trim();
	}catch(err){
	}
	startTcpServer.call(this, tcpPort||DEFAULT_TCP_PORT);
	
};

ResourceProvider.prototype.addFileResource = function(resName, resUrl){
	var jpg = new FileResource(resName, resUrl);
	jpg.addToRepository(this.resources);

};

// var jpg = new FileResource("London", "../13.jpg");
// jpg.addToRepository(resources);

// var jpg2 = new FileResource("Koala", "../Koala.jpg");
// jpg2.addToRepository(resources);

// var jpg3 = new FileResource("Cristiano", "../Cristiano.jpg");
// jpg3.addToRepository(resources);

// var jpg4 = new FileResource("German", "../German.jpg");
// jpg4.addToRepository(resources);


/**
 * ���յ� ����㲥
 * 
 * @param block
 *            ����㲥buffer
 */
var onRequestBroadcastArrived = function(block) {
	try {
		var that = this;
		parser.parse(block, function(requestBroadcast) {
			console.dir(requestBroadcast);
			handleRequestBroadcast.call(that, requestBroadcast);
		});

	} catch (err) {
		console.error('Error occured when parsing a request broadcast!');
		console.error(err);
	}
};

var handleRequestBroadcast = function(reqBc) {
	console.log('handle request broadcast from ' + reqBc.requesterId);
	// validate the request
	var rtnCode = validateRequestBroadcast.call(this, reqBc);
	if (rtnCode == 200) {
	
		// find the resource
		var res = findResourceByResquest.call(this, reqBc);
		// build the proposal provision
		var ppBuf = generator.buildProposalProvisionBuffer(reqBc.requestCode,
				res, this.clientId, reqBc.transTypeRequirement, this.transmissionSpeed);

		sendMessage.call(this, TOPIC_OFFICIAL_RESPONSE + reqBc.requesterId, ppBuf);
		
		var msg = 'Hi ' + reqBc.requesterId + ', I get what you need!';
		sendNotifyMessage.call(this, TOPIC_NRLP_TALK, msg);
	}
};

var sendNotifyMessage = function(topic, _msg){
	var pack = {
		clientId : this.clientId,
		msg : _msg
	};
	var str = JSON.stringify(pack);
	this.mqttClient.publish(topic, new Buffer(str), 2);
};

var findResourceByResquest = function(reqBc) {
	var resName = reqBc.requestedResourceName;
	return this.resources[resName];
};

/**
 * ���յ� ��Դ����
 * 
 * @param block
 */
var onOfficialRequestArrived = function(block) {
	// try {
	var that = this;
		parser.parse(block, function(officialRequest) {
			
			handleOfficialRequest.call(that, officialRequest);
		});

	// } catch (err) {
		// console.error('Error occured when parsing a request broadcast!');
		// console.error(err);
	// }
};

var handleOfficialRequest = function(officialRequest) {
	console.log("handling the official request from "
			+ officialRequest.requesterId);
	// do validation if needed
	// build official response
	// get a transmission code //TODO RECYCLE
	//console.dir(this);
	var transCode = this.transCodeGenerator.next();
	var _res = this.resources[officialRequest.resourceName];
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
	this.transTasks[transTask.code] = transTask;
	var officialRespBuff = generator.buildOfficialResponseBuffer(transTask,
			this.clientId, this.tcpLocation);
			
	sendMessage.call(this, TOPIC_OFFICIAL_RESPONSE + transTask.requesterId,
			officialRespBuff);
	var msg = 'Ok. I get you the location of the resource, help yourself!';
	sendNotifyMessage.call(this, TOPIC_NRLP_TALK, msg);

};

/**
 * 
 * 
 */
var validateRequestBroadcast = function(reqBc) {
	var resName = reqBc.requestedResourceName;
	var transType = reqBc.transTypeRequirement;

	if (typeof this.resources[resName] !== 'undefined') {
		// console.dir(resources[resName]);
		var foundTransType = this.resources[resName].supportTransType
				.indexOf(transType) >= 0 ? true : false;
		if (foundTransType)
			return 200;
	}
	return 404;
};

var sendMessage = function(topic, payload) {
	this.mqttClient.publish(topic, payload);
};

/**
 * TODO get an available transmission code.
 */
// var getAvailableTransmissionCode = function() {
	// return ;
// };

// var tcpClients = {};

// var tcpServer = null;

var startTcpServer = function(port) {
	var that = this;
	this.tcpServer = net.createServer(function(c) {
		console.log('tcp server started!');

		c.on('data', function(buf) {

			console.log('data from tcp');
			console.log('bytes received: ' + c.bytesRead);
			console.log('data size: ' + buf.length);

			if (typeof c.readingStage !== 'undefined' && c.readingStage == 3) {
				// reading params
				readTransmissionRequestParams.call(that, c, buf);
			} else if (typeof c.readingStage !== 'undefined'
					&& c.readingStage == 2) {
				// reading remain length
				readTransReqRemainLength.call(that, c, buf);
			} else if (typeof c.readingStage !== 'undefined'
					&& c.readingStage == 1) {
				// reading transCode
				readTransmissionCode.call(that, c, buf);
			} else if (typeof c.readingStage === 'undefined'
					|| c.readingStage == 0) {
				// reading head
				readTransmissionRequestHead.call(that, c, buf);
			}
			// ////////////////////////////////////////////////

		});
		
	});
	this.tcpServer.listen(port, function() { // 'listening' listener
		console.log('tcpserver bound');
	});

};

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
				readTransmissionCode.call(this, c, rest);
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
			this.tcpClients[c.transCode] = c;
			var rest = buf.slice(i + 1);
			c.readingStage = 2;
			readTransReqRemainLength.call(this, c, rest);
			break;
		}
	}

};

/**
 * reading the remain length
 */
var readTransReqRemainLength = function(c, buf) {
	var task = this.transTasks[c.transCode];
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
			readTransmissionRequestParams.call(this, c, rest);
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
	var task = this.transTasks[c.transCode];
	if (typeof task.parameters === 'undefined') {
		task.parameters = new Buffer(0);
	}
	task.parameters = bops.join([ task.parameters, buf ]);
	if (task.parameters.length > c.remainLength) {
		// TODO
		console
				.error('reading transmission request params error, larger than remain length!');
	} else if (task.parameters.length === c.remainLength) {
		handleTransmissionRequestWithParams.call(this, task);
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

	var c = this.tcpClients[task.code];
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
	}
	resumableTransfer.call(this, task.resource.fd, c, task.resource.size, offset);
};

var getOffsetFromParams = function(buf) {
	return io_util.readMultiByteIntegerSync(buf);
};

var resumableTransfer = function(fd, c, fileSize, offset) {

	var msg = 'Now start transmission from offset ' + offset + '!';
	sendNotifyMessage.call(this, TOPIC_NRLP_TALK, msg);

	var chunkSize = this.transmissionSpeed * 1024;
	var timer = 0;
	
	var that = this;
	
	(function loop(bytesSent) {
		setTimeout(function() {
			timer = 100;
			// the bytes out after this time
			var bytesOut = bytesSent + chunkSize;
			//
			if (fileSize >= bytesOut) {

				fs.read(fd, new Buffer(chunkSize), 0, chunkSize, bytesSent,
						function(err, bytesRead, buffer) {
							c.write(buffer);
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