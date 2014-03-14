/// <reference path="../dojo" />

define([ './intern' ], function (config:any) {
	config.environments = [ { browserName: 'chrome' } ];
	config.useSauceConnect = false;
	config.reporters = [ 'console', 'lcovhtml' ]
	//config.excludeInstrumentation = /^(?:dojo|framework\/tests|framework\/node_modules)\//;

	return config;
});
