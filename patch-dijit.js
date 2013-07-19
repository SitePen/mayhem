define([ "require" ], function (require) {
	return {
		load: function (id, parentRequire, load) {
			// 7381 must be loaded before all others because it modifies the _WidgetBase prototype
			require([ "./patch/7381" ], load);
		}
	};
});
