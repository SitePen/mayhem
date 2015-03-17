(function (global) {
	/*jshint -W060 */
	var basePath = location.pathname.replace(/\/tests\/.*$/, '');
	global.dojoConfig = {
		async: true,
		baseUrl: basePath,
		packages: [
			{ name: 'dgrid', location: 'third-party/dgrid' },
			{ name: 'dstore', location: 'third-party/dstore' },
			{ name: 'dojo', location: 'third-party/dojo' },
			{ name: 'dijit', location: 'third-party/dijit' },
			{ name: 'esprima', location: 'third-party/esprima', main: 'esprima' },
			{ name: 'intl', location: 'third-party/intl', main: 'Intl.complete' },
			{ name: 'intl-messageformat', location: 'third-party/intl-messageformat/dist', main: 'intl-messageformat-with-locales' },
			{ name: 'mayhem', location: 'dist' },
			{ name: 'put-selector', location: 'third-party/put-selector' },
			{ name: 'tests', location: 'tests' },
			{ name: 'xstyle', location: 'third-party/xstyle' }
		]
	};

	document.write('<script src="' + basePath + '/third-party/dojo/dojo.js"><\/script>');
})(this);
