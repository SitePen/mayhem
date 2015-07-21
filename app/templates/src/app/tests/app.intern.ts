import intern = require('intern');

var config:intern.Config = {
	excludeInstrumentation: intern.args.fast ?
		/./ :
		/(?:^|[\/\\])(?:(?:node_modules|tests|dojo|dijit|dstore|put-selector|xstyle|dgrid|messageformat|mayhem)[\/\\]|Gruntfile\.js$)/,
	loader: {
		packages: [
			{ name: 'dojo', location: 'src/dojo' },
			{ name: 'dijit', location: 'src/dijit' },
			{ name: 'dstore', location: 'src/dstore' },
			{ name: 'put-selector', location: 'src/put-selector' },
			{ name: 'xstyle', location: 'src/xstyle' },
			{ name: 'dgrid', location: 'src/dgrid' },
			{ name: 'messageformat', location: 'src/messageformat' },
			{ name: 'mayhem', location: 'src/mayhem' },
			{ name: 'app', location: 'src/app' }
		]
	},
	suites: [
		'app/tests/unit/all'
	],
	functionalSuites: [
		'app/tests/functional/all'
	]
};

export = config;
