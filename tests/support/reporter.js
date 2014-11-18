define([
	'intern/dojo/node!istanbul/lib/instrumenter',
	'intern/dojo/node!istanbul/lib/collector',
	'intern/dojo/node!istanbul/lib/report/html',
	'intern/dojo/node!istanbul/lib/report/text',
	'intern/dojo/node!globule',
	'intern/dojo/node!fs',
	'intern/dojo/node!path',
	'intern',
	'intern/lib/util',
	'intern/dojo/node!diff',
	'intern/dojo/node!util',
	'intern/dojo/node!istanbul/index'
], function (Instrumenter, Collector, Reporter, TextReporter, globule, fs, path, main, util, diffUtil, nodeUtil) {
	var getCanonical = (function () {
		var stack = [];

		return function makeCanonical(value) {
			if (value && typeof value === 'object' && !Array.isArray(value)) {
				if (stack.indexOf(value) > -1) {
					return '[Circular]';
				}

				var canonical = {};
				var keys = Object.keys(value).sort();
				stack.push(value);
				keys.forEach(function (key) {
					canonical[key] = makeCanonical(value[key]);
				});
				stack.pop();
				return canonical;
			}

			return value;
		};
	})();

	var instrumenter = new Instrumenter({
		noCompact: true,
		noAutoWrap: true
	});
	var collector = new Collector();
	var reporter = new Reporter();
	var collected = {};

	return {
		'/suite/end': function (suite) {
			var numTests = suite.get('numTests');
			var numFailedTests = suite.get('numFailedTests');
			var numSkippedTests = suite.get('numSkippedTests');
			var message = suite.get('id') + ' - ' + numFailedTests + '/' + numTests + ' tests failed';
			if (numSkippedTests > 0) {
				message += ' (' + numSkippedTests + ' skipped)';
			}
			message += ' (' + suite.timeElapsed + 'ms)';
			console[numFailedTests ? 'warn' : 'info'](
				'\x1b[' + (numFailedTests ? '91' : '92') + ';1m' +
				(numFailedTests ? 'FAIL: ' : 'PASS: ') + message +
				'\x1b[0m'
			);
		},

		'/error': function (error) {
			console.warn('\x1b[91;1mFATAL ERROR\x1b[0m');
			util.logError(error);
		},

		'/test/pass': function (test) {
			console.log('\x1b[32mPASS: ' + test.get('id') + ' (' + test.timeElapsed + 'ms)\x1b[0m');
		},

		'/test/skip': function (test) {
			console.log(
				'\x1b[33mSKIP: ' + test.get('id') + (test.skipped ? ' (' + test.skipped + ')' : '') + '\x1b[0m'
			);
		},

		'/test/fail': function (test) {
			console.error('\x1b[31mFAIL: ' + test.get('id') + ' (' + test.timeElapsed + 'ms)\x1b[0m');

			if (
				test.error.name === 'AssertionError' &&
				(typeof test.error.actual === 'object' || typeof test.error.expected === 'object')
			) {
				console.log('\n' +
					diffUtil.createPatch(
						'',
						nodeUtil.inspect(getCanonical(test.error.actual), { depth: null }) + '\n',
						nodeUtil.inspect(getCanonical(test.error.expected), { depth: null }) + '\n'
					).split('\n').slice(5).join('\n').replace(/^([+-])(.*)$/gm, function (_, indicator, line) {
						return '\x1b[3' + (indicator === '+' ? '2mE' : '1mA') + line + '\x1b[0m';
					})
				);
			}
			util.logError(test.error);
		},

		'/coverage': function (sessionId, coverage) {
			for (var filename in coverage) {
				collected[filename] = true;
			}

			collector.add(coverage);
		},

		stop: function () {
			if (!main.args.fast && !main.args.skipExtraFiles) {
				console.log('Instrumenting remaining files…');

				var coverage = {};
				globule.find({
					src: [ '**/*.js' ],
					filter: function (filepath) {
						return !main.config.excludeInstrumentation.test(filepath) && !collected[path.resolve(filepath)];
					}
				}).forEach(function (filepath) {
					try {
						var wholename = path.resolve(filepath);
						instrumenter.instrumentSync(fs.readFileSync(wholename, 'utf8'), wholename);
						coverage[wholename] = instrumenter.lastFileCoverage();
						// https://github.com/gotwarlost/istanbul/issues/102
						for (var i in coverage[wholename].s) {
							coverage[wholename].s[i] = 0;
						}
					}
					catch (error) {
						console.error(filepath + ': ' + error);
					}
				});
				collector.add(coverage);
			}

			if (!main.args.fast) {
				(new TextReporter()).writeReport(collector, true);
				reporter.writeReport(collector, true);
			}
		}
	};
});
