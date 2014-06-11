var mqtt = require('mqtt');
var parser = require('./parser.js');
var generator = require('./generator.js');
var protocol_head = require('./protocol_head.js');
var protocol = require('./protocol.js');

var _clientId = 'res-requester-' + Math.floor(Math.random() * 100);

var TOPIC_REQUEST_BROADCAST = 'nrlp/res/req/broadcast';
var TOPIC_OFFICIAL_REQUEST = 'nrlp/res/req/listener/';
var TOPIC_OFFICIAL_RESPONSE = 'nrlp/res/resp/listener/' + _clientId;

var requestTasks = {};

/**
 * when mqtt is connected.
 */
var onMqttConnected = function() {
	var topics = [ TOPIC_OFFICIAL_RESPONSE ];
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

	setTimeout(sendTestBroadcast, 3000);
};

var sendTestBroadcast = function() {
	var task = {
		code : 0,
		resourceName : 'testResName',
		resourceType : protocol.PROTOCOL_RESTYPE_FILE,
		transmissionType : protocol.PROTOCOL_TRANSTYPE_RETRYABLE,
		state : 0, // 0: look up; 1: engaged;
		received : 0
	// byte
	};
	requestTasks[task.code] = task;
	var rbbuf = generator.buildRequestBroadcastBuffer(task, _clientId);
	mqttClient.publish(TOPIC_REQUEST_BROADCAST, rbbuf);
	console.log("publishing on TOPIC: " + TOPIC_REQUEST_BROADCAST + " length: "
			+ rbbuf.length);
};

var onMqttMessageArrived = function(topic, message) {

	try {
		parser
				.parse(
						message,
						function(msg) {
							if (msg.messageType === protocol_head.PROTOCOL_PROPOSAL_PROVISION) {
								handleProposalProvision(msg);
							} else if (msg.messageType === protocol_head.PROTOCOL_OFFICIAL_RESPONSE) {
								handleOfficialResponse(msg);
							}
						});

	} catch (err) {
		console.error('Error occured when parsing a response!');
		console.error(err);
	}

};

var mqttClient = mqtt.createClient(1883, 'localhost', {
	clientId : _clientId,
	encoding : 'binary'
});

mqttClient.on('connect', onMqttConnected.bind(mqttClient));

mqttClient.on('message', onMqttMessageArrived.bind(mqttClient));

var handleProposalProvision = function(proposal) {
	// TODO
	console.log("received a proposal provision");
	console.dir(proposal);
	if (requestTasks[proposal.requestCode]
			&& requestTasks[proposal.requestCode].state === 0) {
		//有该任务，并且仍在寻找
		// 正式请求
		var officialRequestBuf = generator.buildOfficialRequestBuffer(requestTasks[proposal.requestCode], _clientId);
		mqttClient.publish(TOPIC_OFFICIAL_REQUEST + proposal.providerId, officialRequestBuf);
		console.log("publishing on topic: " + TOPIC_OFFICIAL_REQUEST + proposal.providerId);
	}

};

var handleOfficialResponse = function(msg) {
	// TODO

	console.log("received a OfficialResponse");
	console.dir(msg);
};
