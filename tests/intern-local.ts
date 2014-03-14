/// <reference path="../dojo" />

define([ './intern' ], function (config:any) {
	config.environments = [ { browserName: 'chrome' } ];
	config.useSauceConnect = false;
	config.excludeInstrumentation = /^(?:dojo|dijit|framework\/tests|framework\/node_modules)\//;
	//config.excludeInstrumentation = /./;
	config.reporters = [ 'console', 'lcovhtml' ]
	return config;
});
