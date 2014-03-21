/// <reference path="../dojo" />

define([ './intern' ], function (config:any) {
	config.environments = [ { browserName: 'chrome' } ];
	config.useSauceConnect = false;
	config.excludeInstrumentation = /^(?:dojo|dijit|framework\/tests|framework\/node_modules)\//;
	//config.excludeInstrumentation = /./;
	config.webdriver['host'] = '10.0.1.123';
	config.proxyUrl = 'http://10.0.1.105:' + config.proxyPort;
	config.reporters = [ 'runner', 'lcovhtml' ]

	return config;
});
