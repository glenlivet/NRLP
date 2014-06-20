var protocol_head = require('../protocol_head.js');
var bops = require('bops');
var io_util = require('../io_util.js');
var protocol = require('../protocol.js');

var ProposalProvision = module.exports = function ProposalProvision() {
	
	this.messageType = protocol_head.PROTOCOL_PROPOSAL_PROVISION;
	this.requestCode = null;
	this.resourceSize = null;
	this.providerId = null;
	this.transmissionType = null;
	this.transmissionSpeed = null;
};

ProposalProvision.prototype.toBuffer = function() {
	// get Protocol head byte array.
	var headBuf = protocol_head
			.getProtocolHead(protocol_head.PROTOCOL_PROPOSAL_PROVISION);
	// write request code
	var reqCodeBuf = new Buffer(2);
	reqCodeBuf.writeUInt16BE(this.requestCode, 0);
	// write resource name
	var resNameBuf = io_util.writeUTF8(this.resourceName);
	// write resource type
	var resTypeBuf = new Buffer(2);
	resTypeBuf.writeUInt16BE(this.resourceType, 0);

	// write resource size if resource is static
	var resSizeBuf = null;
	if (this.resourceType < protocol.PROTOCOL_RESTYPE_DYNAMIC) {
		resSizeBuf = io_util.writeMultiByteInteger(this.resourceSize);
	}
	// write provider id
	var providerIdBuf = io_util.writeUTF8(this.providerId);
	// write transmissionType
	var transTypeBuf = new Buffer(1);
	transTypeBuf.writeUInt8(this.transmissionType, 0);
	// write transmission speed if resource is retriable
	var transSpeedBuf = null;
	if (this.transmissionType === protocol.PROTOCOL_TRANSTYPE_RETRYABLE) {
		transSpeedBuf = new Buffer(2);
		transSpeedBuf.writeUInt16BE(this.transmissionSpeed, 0);
	}
	return bops.join([ headBuf, reqCodeBuf,resNameBuf, resTypeBuf,
			resSizeBuf || new Buffer(0), providerIdBuf, transTypeBuf,
			transSpeedBuf || new Buffer(0) ]);
};

ProposalProvision.parse = function(block, cb){
	// construct an empty ProposalProvision Object
	var rtn = new ProposalProvision();
	//remove the first 8 bytes, it's the head
	var buf = block.slice(8);
	// read request code
	rtn.requestCode = buf.readUInt16BE(0);
	var buf1 = buf.slice(2);
	//read resource name
	io_util.readUTF8(buf1, function(resName, rest1){
		rtn.resourceName = resName;
		//read the resource type
		rtn.resourceType = rest1.readUInt16BE(0);
		//remove this part from buffer
		var rest2 = rest1.slice(2);
		//read the resource size if resource is static
		if(rtn.resourceType < protocol.PROTOCOL_RESTYPE_DYNAMIC){
			io_util.readMultiByteInteger(rest2, function(resSize, rest3){
				rtn.resourceSize = resSize;
				//read the provider id
				io_util.readUTF8(rest3, function(pId, rest4){
					rtn.providerId = pId;
					//read the transmissionType
					rtn.transmissionType = rest4.readUInt8(0);
					if(rtn.transmissionType === protocol.PROTOCOL_TRANSTYPE_RETRYABLE){
						var rest5 = rest4.slice(1);
						rtn.transmissionSpeed = rest5.readUInt16BE(0);
					}
					cb(rtn);
				});
			});
		} else {
			//if resource is not static
			//there would be a resource size in msg
			//just read the provider id
			io_util.readUTF8(rest2, function(pId, rest3){
				rtn.providerId = pId;
				//read the transmissionType
				rtn.transmissionType = rest3.readUInt8(0);
				if(rtn.transmissionType === protocol.PROTOCOL_TRANSTYPE_RETRYABLE){
					var rest4 = rest3.slice(1);
					rtn.transmissionSpeed = rest4.readUInt16BE(0);
				}
				cb(rtn);
			});
		}
	});
	
};
