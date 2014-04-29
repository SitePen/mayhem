import WebApplication = require('framework/WebApplication');
import has = require('framework/has');
import config = require('./config');

WebApplication.start(config).then((app:WebApplication):void => {
	console.log('ready');
	if (has('debug')) {
		window['app'] = app;
	}
});
