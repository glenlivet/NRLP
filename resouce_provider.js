
var mqtt = require('mqtt');
//nrslЭ�����
var nrsl = require('nrsl.js');

var _clientId = 'res-provider-' + Math.floor(Math.random()*100);

var mqttClient = mqtt.createClient(1883, 'localhost', {clientId : _clientId});

var TOPIC_REQUEST_BROADCAST = 'nrlp/res/req/broadcast';
var TOPIC_RESOURCE_REQUEST  = 'nrlp/res/req/listener/' + _clientId;

//��������
mqttClient.on('connect', onMqttConnected.bind(mqttClient));
//����message
mqttClient.on('message', onMqttMessageArrived.bind(mqttClient));

/**
 * ������ӵĻص�������������
 */
var onMqttConnected = function(){
	var topics = [TOPIC_REQUEST_BROADCAST, TOPIC_RESOURCE_REQUEST];
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
 * ���յ�MQTT��Ϣ�Ļص�
 * @param topic MQTT topic.
 * @param message MQTT payload.
 */
var onMqttMessageArrived = function(topic, message){
	//��Ϊ ����㲥ʱ
	if(topic === TOPIC_REQUEST_BROADCAST){
		onRequestBroadcastArrived.call(this, message);
	}else if(topic === TOPIC_RESOURCE_REQUEST){
		onResourceRequestArrived.call(this, message);
	}else {
		console.warn('Unexpected MQTT message received. topic: ' + topic);
	}
};

/**
 * ���յ� ����㲥
 * @param block ����㲥buffer
 */
var onRequestBroadcastArrived = function(block){
	try{
		//�㲥������� //TODO ������ֵ
		var requestBroadcast =  nrsl.parse(block, PROTOCOL_BROADCAST_REQUEST);
		//����֤�������Ƿ��и�������Դ���ÿͻ��Ƿ���Ȩ�޵ȡ�
		var rtnCode = validateRequestBroadcast(requestBroadcast);
		//���� rtnCode ����Ӧ�Ļ�Ӧ
		handleRequestBroadcast.call(this, rtnCode, requestBroadcast);
	}catch(err){
		console.error('Error occured when parsing a request broadcast!');
		console.error(err);
	}
};

/**
 * ���յ� ��Դ����
 * @param block 
 */
var onResourceRequestArrived = function(block){
	//TODO
};

/**
 * ���� ����㲥
 * @param requestBroadcast ����㲥����
 */
var handleRequestBroadcast = function(rtnCode, requestBroadcast){
	if(rtnCode === 200){
		//��֤ͨ��
		//����ResourceTranmissionProposal����
		//���ö����ͳ�ȥ
	}else {
		console.info('RequestBroadcast validation results as rtnCode = ' + rtnCode);
		//TODO ��������rtnCode
	}
};

/**
 * ҵ����֤ ����㲥�������Ƿ��и�������Դ���ÿͻ��Ƿ���Ȩ�޵ȡ�
 */
var validateRequestBroadcast = function(requestBroadcast){
	//TODO 
	return 200;
};