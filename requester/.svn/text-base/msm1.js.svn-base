//定义数据模型node节点，line线条；A和B可以作为id
/**
 * activity节点数据结构
 */
var node = new Object;
node.preAId = new Object ;
node.aId = new Array() ;
node.percentage = new Object ;
node.poId = new Object() ;
node.label = new Object() ;

var size = 0 ;
var proId;
/*开始连接线的颜色为黑色*/
var beginConnectionColor = "rgba(0,0,0 ,0.8)" ;
/*启动服务后连接线的颜色为绿色*/
var currentConnectionColor = "rgba(46,164,26,0.8)" ;
/*node.label的位置坐标*/
var leftStr ;
var topStr ;

window.onload = function(){
	start();
}
//两个target进行连接
function connectionTwoTarget(s , t ,lineColor){
	jsPlumb.connect({  
			source:s, 
			target:t, 
			//连接器采用流程图连线，cornerRadius流程图线在折线处为圆角
			connector:[ "Flowchart", { cornerRadius:10 }  ],
			//锚，连接器在两个window连接的位置
			anchors:["RightMiddle", "LeftMiddle"],  
			//连接线样式
			paintStyle:{ 
				//连接线颜色渐变
				lineWidth:1, 
				strokeStyle:lineColor ,
				outlineWidth:1,
				joinstyle:"round",	
			},
			//鼠标悬浮连接线样式
			hoverPaintStyle:{ strokeStyle:"#7ec3d9" },
			endpoint:"Blank",
			overlays:[ ["PlainArrow", {location:1, width:15, length:12} ]],
			//端点样式
	    });
}
/**
 * jsPlumb初始化
 */
function init(){
	jsPlumb.importDefaults({
		DragOptions : { cursor: "pointer", zIndex:2000 },
		HoverClass:"connector-hover"
	});
	connectionTwoTarget("activity1" , "activity3", beginConnectionColor) ;
	//模拟动态流动
	setTimeout('connectionTwoTarget("activity3" , "activity2",beginConnectionColor)' ,0); 
	setTimeout('connectionTwoTarget("activity3" , "activity4",beginConnectionColor )' ,0); 
	var connectorStrokeColor = "rgba(50, 50, 200, 1)",
	connectorHighlightStrokeColor = "rgba(180, 180, 200, 1)",
	hoverPaintStyle = { strokeStyle:"#7ec3d9" };	
}
//更新数据模型
var color;
//绘制连接线
function drawPath(c){
	var p = $(c.canvas).find("path");
	var	l = p[0].getTotalLength();
	var	i = l, d = -10, s = 150,
		att = function(a, v) {
			for (var i = 0; i < p.length; i++)
				p[i].setAttribute(a, v);
		},
		tick = function() {
			if (i > 0) {
				i += d;
				att("stroke-dashoffset", i);
				window.setTimeout(tick, s);
			}
		};
	
	att("stroke-dasharray", l + " " + l);
	tick();
}
//Demo 测试 更新数据模型
var t = -10;
var color;           
var RPC_URl = "" ;
//启动
function start(){
	var resetRenderMode = function(desiredMode) {
		var newMode = jsPlumb.setRenderMode(desiredMode);			
	};
	resetRenderMode(jsPlumb.SVG);
	init();
	//点击开始按钮，启动服务器
	$("#begin").bind("click" , function(){
		//$.get(RPC_URl, function(data){
		//});
		//取消connection事件
		//jsPlumb.unbind("connection", function(info) {
			//连接线绘制时采用动态绘制
			//drawPath(info.connection);
		//});
		//speack("activity1" , "client" , "我要资源A");
		//setTimeout('speack("activity4" , "App1" , "我有资源A")',3000);
		//setTimeout('speack("activity2" , "App2" , "我有资源A")',5000);
		//setTimeout('speack("activity1" , "Client" , "我从App1处取资源")',7000);
		//setTimeout('speack("activity4" , "App1" , "传输资源")',10000);
		//setTimeout('addProgress("10")',13000);
		//setTimeout('addProgress("20")',14000);
		//setTimeout('addProgress("30")',15000);
		//setTimeout('addProgress("40")',16000);
		//setTimeout('addProgress("50")',17000);
		//setTimeout('addProgress("60")',18000);
		//setTimeout('addProgress("70")',19000);
		//setTimeout('addProgress("80")',20000);
		//setTimeout('addProgress("90")',21000);
		//setTimeout('addProgress("100")',22000);
		//initMqttClient();
	});
	initMqttClient();
}
//收mqtt信息
function receive(){
}
var test;
function speack(obj ,title , msg){
	console.log('speack'+title + ' ' + msg);
	$("#"+obj).attr("title",title);
	$("#"+obj).attr("data-content",msg);
	$("#"+obj).popover('show');
	test = obj;
	setTimeout('$("#"+test).popover("hide");' ,1500); 
	//setTimeout('hidePopover(test)',1000);
	//setInterval(hidePopover(obj),2000);
}
function addProgress(msg){
	console.log('addProgress' + ' ' + msg);
	$("#progress div").attr("aria-valuenow",msg);
	$("#progress div").attr("style","width:"+msg+"%");
	$("#progress span").html(msg+"%");
}
function hidePopover(obj){
	$("#"+obj).popover("hide");
}
// 节点与对应的node转换
function convert(obj){
	return "";
}
var MQTT_PORT = 1883,
	MQTT_HOST = '10.253.44.235',
	MQTT_TALK_TOPIC = 'nrlp/talk/msg';
	MQTT__PROGRESS_TOPIC = 'nrlp/progress/percentage';
var mqtt    = require('mqtt');
var initMqttClient = function(){
	var topics = [ MQTT_TALK_TOPIC,MQTT__PROGRESS_TOPIC ];
	_mqttClient_talk = mqtt.createClient(MQTT_PORT, MQTT_HOST);
	_mqttClient_talk.subscribe(topics);
	_mqttClient_talk.on('message', function(topic, message) {
		console.log(topic + ' ' + message);
		var mess = JSON.parse(message);
		if(topic.trim() == "nrlp/talk/msg"){
			if(mess.clientId.trim() == "Shulai.Zhang"){
				console.log(topic + ' ' + mess.clientId);
				$("#activity1").attr("title",mess.clientId);
				$("#activity1").attr("data-content",mess.msg);
				$("#activity1").popover('show');
				setTimeout('$("#activity1").popover("hide");' ,5000); 
			}else if(mess.clientId.trim() == "Qiaoqiao.li"){
				console.log(topic + ' ' + mess.clientId);
				if(mess.msg.trim() == "Sorry guys, I gotta go!"){
					$("#activity4 img").attr("src","img/qiaoqiao.li.gray.png");
				}
				$("#activity4").attr("title",mess.clientId);
				$("#activity4").attr("data-content",mess.msg);
				$("#activity4").popover('show');
				setTimeout('$("#activity4").popover("hide");' ,5000); 
			}else if(mess.clientId.trim() == "Bingjue.Sun"){
				console.log(topic + ' ' + mess.clientId);
				if(mess.msg.trim() == "Sorry guys, I gotta go!"){
					$("#activity2 img").attr("src","img/bingjue.sun.gray.png");
				}
				$("#activity2").attr("title",mess.clientId);
				$("#activity2").attr("data-content",mess.msg);
				$("#activity2").popover('show');
				setTimeout('$("#activity2").popover("hide");' ,5000); 
			}
		}else if(topic.trim() == "nrlp/progress/percentage"){
			//addProgress(message.msg*100);
			addProgress(Math.round(eval(mess.msg+"*"+100)));
		}	
	  });
}



