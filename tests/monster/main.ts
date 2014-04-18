/// <reference path="../../dojo.d.ts" />
/// <reference path="../../xstyle.d.ts" />

import config = require('./config');
import hasClass = require('xstyle/has-class');
import WebApplication = require('framework/WebApplication');

declare var exports:any;

WebApplication.start(config).then((app:WebApplication):void => {
	hasClass('tablet', 'phone');
	console.log('ready');
	exports.app = app;
});
