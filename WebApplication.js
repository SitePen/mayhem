define([
	'dojo/_base/declare',
	'dojo/request/util',
	'./Application'
], function (declare, util, Application) {
	return declare(Application, {
		_getDefaultConfig: function () {
			//	summary:
			//		Extends the default configuration with Web-app-specific
			return util.deepCopy(this.inherited(arguments), {
				modules: {
					ui: {
						constructor: 'app/views/ApplicationView'
					}
				}
			});
		},

		createUrl: function () {
			//	summary:
			//		Convenience function for generating the correct URL for a route.

			var router = this.get('router');
			return router.createUrl.apply(router, arguments);
		},

		startup: function (options) {
			var self = this;

			options = options || {};
			options.startModules = false;

			var promise = this.inherited(arguments, [ options ]).then(function () {
				self.ui.placeAt(document.body);
				return self.startupModules();
			});

			this.startup = function () {
				return promise;
			};

			return promise;
		}
	});
});