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
					router: {
						constructor: 'framework/routing/HashRouter'
					},
					ui: {
						constructor: 'app/views/ApplicationView'
					}
				}
			});
		},

		place: function (view, placeholder) {
			return this.ui.addSubView(view, placeholder);
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