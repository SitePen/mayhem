import WebApplication = require('mayhem/WebApplication');
import has = require('mayhem/has');
import config = require('./config');

WebApplication.start(config).then((app:WebApplication):void => {
	console.log('ready');
	if (has('debug')) {
		window['app'] = app;
	}
});
