define([ "require", "./patch-dijit!" ], function (require) {
	return {
		load: function (id, parentRequire, load) {
			// disable-href-transition must be loaded before all others because it modifies the
			// _ItemBase prototype
			require([ "./patch/disable-href-transition" ], function () {
				// the rest of these do not modify any widgets that are prototypes of other
				// widgets that are loaded at the time the framework/patch module is
				// require()d so they can be loaded in a group
				require([
					"./patch/disable-view-resizing",
					"./patch/ensure-mblView-class",
					"./patch/16183",
					"./patch/16313",
					"./patch/16314",
					"./patch/16316",
					"./patch/16347",
					"./patch/16350"
				], load);
			});
		}
	};
});
