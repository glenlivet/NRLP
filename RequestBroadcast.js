

var RequestBroadcast = module.exports = function RequestBroadcast(){
	//��Դ�����ߵ�ID
	this.requesterId = null;
	//������Դ������
	this.requestedResourceName = null;
	//������Դ������
	this.requestedResourceType = null;
	//����Ĵ��䷽ʽ
	this.transTypeRequirement = null;
	//����������URL
	this.proposalDropLocation = null;
};

RequestBroadcast.prototype.toBuffer = function(){
	//protocol ͷ
	//����㲥����
};