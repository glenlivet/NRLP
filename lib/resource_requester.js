var mqtt = require('mqtt');
var parser = require('./parser.js');
var generator = require('./generator.js');
var protocol_head = require('./protocol_head.js');
var protocol = require('./protocol.js');
var net = require('net');
var io_util = require('./io_util.js');
var bops = require('bops');
var CodeGenerator = require('./code_generator.js');

var util = require("util");
var events = require("events");

var RequestTask = require('./request_task.js');

var TALK_TIME = 2000;

var TOPIC_REQUEST_BROADCAST = 'nrlp/res/req/broadcast';
var TOPIC_OFFICIAL_REQUEST = 'nrlp/res/req/listener/';

var REQUESTER_CLIENTID_PREFEX = 'res-requester-';

var EVENT_RESORUCE_NOT_FOUND = 'resource_not_found';	// param: resource obj
var EVENT_RESOURCE_READY = 'resource_ready';	//params: resource obj, resource
var EVENT_RESOURCE_HIT = 'resource_hit'; 	// resource obj

var TOPIC_NRLP_TALK = 'nrlp/talk/msg';
var TOPIC_NRLP_PROGRESS = 'nrlp/progress/percentage';

var ResourceRequester = module.exports = function ResourceRequester(opts){
	this.clientId = null;
	//generate requestCode
	this.reqCodeGenerator = new CodeGenerator();
	this.requestTasks = {};
	this.mqttClient = null; 
	this.opts = opts;
	events.EventEmitter.call(this);
};

util.inherits(ResourceRequester, events.EventEmitter);

ResourceRequester.EVENT_RESORUCE_NOT_FOUND = EVENT_RESORUCE_NOT_FOUND;
ResourceRequester.EVENT_RESOURCE_READY = EVENT_RESOURCE_READY;
ResourceRequester.EVENT_RESOURCE_HIT = EVENT_RESOURCE_HIT;

ResourceRequester.prototype.init = function(cb){
	this.clientId = this.opts.clientId || REQUESTER_CLIENTID_PREFEX + Math.floor((Math.random() * 500) + 1);
	
	this.mqttClient = mqtt.createClient(this.opts.port || 1883, this.opts.host || 'localhost', {
		clientId : this.clientId,
		encoding : 'binary'
	});
	///
	this.reponseTopic = 'nrlp/res/resp/listener/' + this.clientId;
	this.readyCallback = cb;
	this.mqttClient.on('connect', onMqttConnected.bind(this));
	this.mqttClient.on('message', onMqttMessageArrived.bind(this));
	
};

/**
 * when mqtt is connected.
 */
var onMqttConnected = function() {
	var topics = [ this.reponseTopic ];
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
	this.readyCallback();
};

ResourceRequester.prototype.lookup = function(resource, transType){
	//查找资源TODO
	var task = new RequestTask(this.reqCodeGenerator.next(), resource, transType);
	task.on('timeout', onTaskTimeout.bind(this));
	this.requestTasks[task.code] = task;
	task.begin();
	var that = this;
	setTimeout(function(){
	var rbbuf = generator.buildRequestBroadcastBuffer(task, that.clientId);
	that.mqttClient.publish(TOPIC_REQUEST_BROADCAST, rbbuf);
	var msg = 'Hi, does anyone get Resource[' + task.resourceName + '] there?';
	sendMessage.call(that, TOPIC_NRLP_TALK,msg);
	}, TALK_TIME);
};

var onTaskTimeout = function(reqCode){
	console.warn("request code : " + reqCode + " has timeout!");
	var resource = {
			name : this.requestTasks[reqCode].resourceName,
			type : this.requestTasks[reqCode].resourceType
	};
	this.emit(EVENT_RESORUCE_NOT_FOUND, resource);
	this.requestTasks[reqCode] = null;
	this.reqCodeGenerator.recycle(reqCode);
	
};

var sendBroadcast = function(task){
	var that = this;
	setTimeout(function(){
	//发送广播请求
	var msg = 'Hi, does anyone still get Resource[' + task.resourceName + '] there?';
	sendMessage.call(that, TOPIC_NRLP_TALK,msg);
	var rbbuf = generator.buildRequestBroadcastBuffer(task, that.clientId);
	that.mqttClient.publish(TOPIC_REQUEST_BROADCAST, rbbuf);
	}, TALK_TIME);
};

//TODO 转为外部方法
//var sendTestBroadcast = function() {
//	var task = {
//		code : 0,
//		resourceName : 'testResName',
//		resourceType : protocol.PROTOCOL_RESTYPE_FILE,
//		transmissionType : protocol.PROTOCOL_TRANSTYPE_RETRYABLE,
//		state : 0, // 0: look up; 1: engaged; 2: done
//		received : 0
//	// byte
//	};
//	this.requestTasks[task.code] = task;
//	var rbbuf = generator.buildRequestBroadcastBuffer(task, this.clientId);
//	mqttClient.publish(TOPIC_REQUEST_BROADCAST, rbbuf);
//	// console.log("publishing on TOPIC: " + TOPIC_REQUEST_BROADCAST + " length:
//	// "
//	// + rbbuf.length);
//};

var onMqttMessageArrived = function(topic, message) {
	var that = this;
	// try {
	parser
			.parse(
					message,
					function(msg) {
						if (msg.messageType === protocol_head.PROTOCOL_PROPOSAL_PROVISION) {
							handleProposalProvision.call(that, msg);
						} else if (msg.messageType === protocol_head.PROTOCOL_OFFICIAL_RESPONSE) {
							handleOfficialResponse.call(that, msg);
						}
					});

	// } catch (err) {
	// console.error('Error occured when parsing a response!');
	// console.error(err);
	// }

};

//var mqttClient = mqtt.createClient(1883, 'localhost', {
//	clientId : _clientId,
//	encoding : 'binary'
//});
/////
//mqttClient.on('connect', onMqttConnected.bind(mqttClient));
//mqttClient.on('message', onMqttMessageArrived.bind(mqttClient));

var handleProposalProvision = function(proposal) {
	// TODO 提供方案
	console.log("received a proposal provision from " + proposal.providerId);
	// console.dir(proposal);
	if (this.requestTasks[proposal.requestCode]
			&& this.requestTasks[proposal.requestCode].state === 0) {
		// 有该任务，并且仍在寻找
		// 正式请求
		//发送 正式请求
		//TODO
		
		
		this.requestTasks[proposal.requestCode].resourceSize = proposal.resourceSize;
		this.requestTasks[proposal.requestCode].transmissionSpeed = proposal.transmissionSpeed;
		this.requestTasks[proposal.requestCode].engaged(); // 表明该任务已经找到提供者
		var officialRequestBuf = generator.buildOfficialRequestBuffer(
				this.requestTasks[proposal.requestCode], this.clientId);
		var that = this;
		setTimeout(function(){
		that.mqttClient.publish(TOPIC_OFFICIAL_REQUEST + proposal.providerId,
				officialRequestBuf);
		var msg = 'Hi ' + proposal.providerId + ', Can I take the resource from you?';
		sendMessage.call(that, TOPIC_NRLP_TALK, msg);
		}, TALK_TIME);
	}

};

var handleOfficialResponse = function(msg) {
	// TODO
	console.log("received a OfficialResponse from " + msg.providerId);

	var _reqTask = this.requestTasks[msg.requestCode];
	var tcpOpts = renderTcpOpts(msg.resourceLocation);
	_reqTask.tcpOpts = tcpOpts;
	_reqTask.transmissionCode = msg.transmissionCode;
	var that = this;
	setTimeout(
	sendTransRequest.bind(that, _reqTask), TALK_TIME);
};

/**
 * str = ip : port
 * 
 */
var renderTcpOpts = function(str) {
	var rtn = {};
	var arr = str.split(':');
	rtn.port = arr[1];
	rtn.host = arr[0];
	return rtn;
};

var sendTransRequest = function(reqTask) {
	
	//TODO 
	//开始请求TCP传输
	var msg = 'OK! I\'m collecting the resource now from offset ' + reqTask.received + '!';
	sendMessage.call(this, TOPIC_NRLP_TALK, msg);
	
	var that = this;
	var packet = generator.buildTransmissionRequestBuffer(reqTask);
	var _tcpClient = net.connect(reqTask.tcpOpts, function() {
		console.log('connected with reqTask code: ' + reqTask.code);
		_tcpClient.write(packet);
	});
	reqTask.tcpClient = _tcpClient;
	_tcpClient.on('data', function(data) {
//		console.log('data from tcp');
//		console.log('bytes received: ' + _tcpClient.bytesRead);
		console.log('data size: ' + data.length);
		// c.readingStage 0: reading response head (11 bytes) || 1 : reading
		// remlength || 2: reading data
		if (typeof _tcpClient.readingStage !== 'undefined'
				&& _tcpClient.readingStage === 2) {
			// reading data
			readResourceData.call(that, reqTask, data);
			return;
		} else if (typeof _tcpClient.readingStage !== 'undefined'
				&& _tcpClient.readingStage === 1) {
			// reading remLength
			readRemainLength.call(that, _tcpClient, data, reqTask);
		} else if (typeof _tcpClient.readingStage === 'undefined'
				|| _tcpClient.readingStage === 0) {
			// reading response head
			_tcpClient.readingStage = 0;
			readResponseHead.call(that, _tcpClient, data, reqTask);
		}

	});
	_tcpClient.on('end', function() {
		console.log('tcp end!');
	});
	_tcpClient.on('error', function() {
		console.warn('tcp error');
	});
	_tcpClient.on('timeout', function() {
		console.warn('tcp timeout');
	});
	//TODO 
	_tcpClient.on('close', onTcpClientClose.bind(that, reqTask));
};

var onTcpClientClose = function(reqTask){
	console.warn('tcp close');
//	console.dir(reqTask);
	if (reqTask.state == 2 || reqTask.received == reqTask.resourceSize) {
		// remove this reqTask
		this.requestTasks[reqTask.code] = null;
		this.reqCodeGenerator.recycle(reqTask.code);
		return;
	}else {
		console.log('传输发生异常,已接收: ' + reqTask.received);
		sendBroadcast.call(this, reqTask);
		reqTask.restart();
	}
};

/**
 * read the final response head, including protocol head, request code, request
 * result
 * 
 */
var readResponseHead = function(c, data, reqTask) {
	if (typeof c.responseHeadBuf === 'undefined') {
		c.responseHeadBuf = new Buffer(0);
	}
	c.responseHeadBuf = bops.join([ c.responseHeadBuf, data ]);
	if (c.responseHeadBuf.length >= 11) {
		var valid = protocol_head.validateFinalResponseHead(c.responseHeadBuf);
		if (valid) {
			//
			c.readingStage = 1;
			var rest = c.responseHeadBuf.slice(11);
			readRemainLength.call(this, c, rest, reqTask);
		} else {
			console.error("response head protocol error!!");
		}
	}
};

/**
 * read the remain length
 * 
 * @c socket client
 * @data the data received each time
 * @reqTask the related request task
 */
var readRemainLength = function(c, data, reqTask) {
	if (typeof c.remainLength === 'undefined') {
		c.remainLengthOctets = [];
	}
	for ( var i = 0; i < data.length; i++) {
		var digit = data.readUInt8(i, i + 1);
		if ((digit & 0x80) == 0) {
			c.remainLengthOctets.push(digit);
			var remLenBuf = new Buffer(c.remainLengthOctets);
			c.remainLength = io_util.readMultiByteIntegerSync(remLenBuf);
//			console.log("remainLength: " + c.remainLength);
			reqTask.currentTcpResourceLength = c.remainLength;
			c.readingStage = 2;
			var leftData = data.slice(i + 1);
			readResourceData.call(this, reqTask, leftData);
			break;
		} else {
			c.remainLengthOctets.push(digit);
			continue;
		}
	}

};

/**
 * when get valid data from provider
 * 
 */
var readResourceData = function(reqTask, data) {
	//
	if (typeof reqTask.resourceData === 'undefined') {

		reqTask.resourceData = new Buffer(0);
	}
	reqTask.resourceData = bops.join([ reqTask.resourceData, data ]);
	reqTask.received = reqTask.resourceData.length;
	// TODO
	if (reqTask.received === reqTask.resourceSize) {
		reqTask.completed(); // done
		onResourceDataHit.call(this, reqTask, data);
		onResourceTransferDone.call(this,reqTask);

	} else if (reqTask.received > reqTask.resourceSize) {
		console.error("fetching resource: " + reqTask.resourceName
				+ " got error!");
		// TODO
		
	} else if (reqTask.received < reqTask.resourceSize) {
		// not enough data, continue
		onResourceDataHit.call(this, reqTask, data);
	}
};

var onResourceDataHit = function(reqTask, data){
	var resource = {
			name : reqTask.resourceName,
			type : reqTask.resourceType,
			partialData : data
	};
	//发送进度
	var progress = reqTask.received / reqTask.resourceSize;
	sendMessage.call(this, TOPIC_NRLP_PROGRESS, progress);
	this.emit(EVENT_RESOURCE_HIT, resource);
};

///
var onResourceTransferDone = function(reqTask) {
	reqTask.tcpClient.end();
	var resource = {
		name : reqTask.resourceName,
		type : reqTask.resourceType,
		data : reqTask.resourceData
	};
	this.emit(EVENT_RESOURCE_READY, resource);
	//发送聊天
	var msg = 'Thank you! JOB DONE!';
	sendMessage.call(this, TOPIC_NRLP_TALK, msg);
};

var sendMessage = function(topic, _msg){
	var pack = {
		clientId : this.clientId,
		msg	: _msg
	};
	var payload = JSON.stringify(pack);
	var buf = new Buffer(payload);
	this.mqttClient.publish(topic, buf, 2);
};
