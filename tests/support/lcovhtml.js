define([
	'intern/dojo/node!istanbul/lib/collector',
	'intern/dojo/node!istanbul/lib/report/html',
	'intern/dojo/node!istanbul/index'
], function (Collector, Reporter) {
	var collector = new Collector(),
		reporter = new Reporter();

	return {
		'/coverage': function (sessionId, coverage) {
			collector.add(coverage);
		},

		'stop': function () {
			reporter.writeReport(collector, true);
		}
	};
});
