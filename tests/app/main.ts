import WebApplication = require('framework/WebApplication');
import config = require('./config');

declare var exports:any;

WebApplication.start(config).then((app:WebApplication):void => {
	console.log('ready');
	exports.app = app;
});
