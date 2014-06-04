

var RequestBroadcast = module.exports = function RequestBroadcast(){
	//资源请求者的ID
	this.requesterId = null;
	//请求资源的名称
	this.requestedResourceName = null;
	//请求资源的类型
	this.requestedResourceType = null;
	//请求的传输方式
	this.transTypeRequirement = null;
	//方案监听的URL
	this.proposalDropLocation = null;
};

RequestBroadcast.prototype.toBuffer = function(){
	//protocol 头
	//请求广播内容
};