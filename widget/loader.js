define([
	'dojo/has',
	'require'
], function (has, loaderContextRequire) {
	// summary:
	//		An AMD loader plugin to select a platform-specific widget implementation at run-time.

	has.add('target-platform', 'desktop');

	return {
		load: function (id, require, load) {
			loaderContextRequire([ './' + has('target-platform') + '/' + id ], load);
		}
	};
});