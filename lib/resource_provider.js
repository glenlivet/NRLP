
var mqtt = require('mqtt');
var parser = require('./parser.js');
var generator = require('./generator.js');
var FileResource = require('./file_resource.js');

var resources = {};

var _clientId = 'res-provider-' + Math.floor(Math.random()*100);

var TOPIC_REQUEST_BROADCAST = 'nrlp/res/req/broadcast';
var TOPIC_OFFICIAL_REQUEST  = 'nrlp/res/req/listener/' + _clientId;
var TOPIC_OFFICIAL_RESPONSE = 'nrlp/res/resp/listener/';
//kb/s
var TRANSMISSION_SPEED = 10;


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
	//TODO
};

/**
 * 
 * 
 */
var validateRequestBroadcast = function(reqBc){
	var resName = reqBc.requestedResourceName;
	var transType = reqBc.transTypeRequirement;
	
	
	if(typeof resources[resName] !== 'undefined'){
		console.dir(resources[resName]);
		var foundTransType = resources[resName].supportTransType.indexOf(transType) >= 0 ? true : false;
		if(foundTransType)
			
			return 200;
	}
	return 404;
};

var sendMessage = function(topic, payload){
	mqttClient.publish(topic, payload);
	console.log("publishing on Topic: " + topic);
	
};