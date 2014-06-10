
var mqtt = require('mqtt');
//nrsl协议对象
var nrsl = require('./nrsl.js');

var resources = {};

var _clientId = 'res-provider-' + Math.floor(Math.random()*100);

var mqttClient = mqtt.createClient(1883, 'localhost', {clientId : _clientId});

var TOPIC_REQUEST_BROADCAST = 'nrlp/res/req/broadcast';
var TOPIC_OFFICIAL_REQUEST  = 'nrlp/res/req/listener/' + _clientId;

//监听连接
mqttClient.on('connect', onMqttConnected.bind(mqttClient));
//监听message
mqttClient.on('message', onMqttMessageArrived.bind(mqttClient));

/**
 * 完成连接的回调：处理订阅主题
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
			console.log('	Topic: ' + tq.topic + ' qos: ' + tq.qos);
		}
		console.log('------------------------------------------');
	});
};

/**
 * 接收到MQTT消息的回调
 * @param topic MQTT topic.
 * @param message MQTT payload.
 */
var onMqttMessageArrived = function(topic, message){
	//当为 请求广播时
	if(topic === TOPIC_REQUEST_BROADCAST){
		onRequestBroadcastArrived.call(this, message);
	}else if(topic === TOPIC_OFFICIAL_REQUEST){
		onOfficialRequestArrived.call(this, message);
	}else {
		console.warn('Unexpected MQTT message received. topic: ' + topic);
	}
};

/**
 * 接收到 请求广播
 * @param block 请求广播buffer
 */
var onRequestBroadcastArrived = function(block){
	try{
		//广播请求对象 //TODO 常量赋值
		nrsl.parse(block, function(requestBroadcast){
			//做验证：包括是否含有该请求资源，该客户是否有权限等。
			var rtnCode = validateRequestBroadcast(requestBroadcast);
			//根据 rtnCode 做相应的回应
			handleRequestBroadcast.call(this, rtnCode, requestBroadcast);
		});
		
	}catch(err){
		console.error('Error occured when parsing a request broadcast!');
		console.error(err);
	}
};

var handleRequestBroadcast = function(reqBc){
	//做验证：包括是否含有该请求资源，该客户是否有权限等。
	var rtnCode = validateRequestBroadcast(reqBc);
	if(rtnCode == 200){
		//
		var res = findResourceByResquest(reqBc);
	}
};

var findResourceByResquest = function(reqBc){
	
};

/**
 * 接收到 资源请求
 * @param block 
 */
var onOfficialRequestArrived = function(block){
	//TODO
};

/**
 * 业务验证 请求广播：包括是否含有该请求资源，该客户是否有权限等。
 */
var validateRequestBroadcast = function(requestBroadcast){
	//TODO 
	return 200;
};