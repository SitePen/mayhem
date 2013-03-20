define([ "require", "./patch-dijit!" ], function (require) {
	//	summary:
	//		Patches bugs in the Dojo Toolkit.

	return {
		load: function (id, parentRequire, load) {
			require([ "./patch-mobile!" ], load);
		}
	};
});
