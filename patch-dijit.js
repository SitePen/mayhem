define([ "require" ], function (require) {
	return {
		load: function (id, parentRequire, load) {
			// 7381 must be loaded before all others because it modifies the _WidgetBase prototype
			require([ "./patch/7381" ], function () {
				// 16308 must be loaded before anything else since it modifies a mixin
				require([ "./patch/16308" ], load);
			});
		}
	};
});
