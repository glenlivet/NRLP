

var ResourceProvider = require('../lib/resource_provider_temp.js');

var opts = {
	clientId : 'provider-ccc',
	tcpLocation	: 'localhost:10177',
	transmissionSpeed : 3
};

var rp = new ResourceProvider(opts);

rp.init();

rp.addFileResource("Koala", "../Koala.jpg");
rp.addFileResource("Cristiano", "../Cristiano.jpg");
rp.addFileResource("German", "../German.jpg");