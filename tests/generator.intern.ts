/// <reference path="./intern" />

import intern = require('intern');

var config:intern.Config = {
	excludeInstrumentation: intern.args.fast ?
		/./ :
		/(?:^|[\/\\])(?:(?:node_modules|tests)[\/\\]|Gruntfile\.js$)/,
	loader: {
		packages: [
			{ name: 'generator-mayhem', location: '.' }
		]
	},
	suites: [
		'tests/unit/all'
	]
};

export = config;
