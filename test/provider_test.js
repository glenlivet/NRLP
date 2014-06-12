

var ResourceProvider = require('../lib/resource_provider.js');

var opts = {
	clientId : 'provider-cc',
	tcpPort : 10133
};

var rp = new ResourceProvider(opts);

rp.init();