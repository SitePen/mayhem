define([
	'dojo/_base/lang',
	'dojo/_base/declare',
	'./has',
	'./components/Component',
	'dojo/Deferred',
	'dojo/request/util',
	'require'
], function (lang, declare, has, Component, Deferred, util, require) {
	var defaultConfig = {
		controllerPath: 'app/controllers',
		defaultController: 'index',
		modules: {
			router: {
				'moduleId': 'framework/components/Router'
			}
		}
	};

	return declare(Component, {
		//	controller: framework/components/Controller
		//		The currently active controller.

		postscript: function (kwArgs) {
			// TODO: Stateful uses postscript to do this, and it seems like it cannot be modified with -chains-. But
			// is it really impossible? Setting things twice is wasteful.

			this.set(util.deepCopy(lang.clone(defaultConfig), kwArgs));
		},

		createUrl: function () {
			//	summary:
			//		Convenience function for generating the correct URL for a route.

			var router = this.get('router');
			return router.createUrl.apply(router, arguments);
		},

		_loadModules: function () {
			//	summary:
			//		Loads application components and attaches them to the Application object.

			var self = this,
				dfd = new Deferred(),
				moduleKeys = [],
				moduleIds = [];

			for (var k in this.modules) {
				moduleKeys.push(k);

				if (!this.modules[k].moduleId) {
					throw new Error('Missing module ID for application component "' + k + '"');
				}

				moduleIds.push(this.modules[k].moduleId);
			}

			require(moduleIds, function () {
				try {
					for (var i = 0, Module, module, key, config; (Module = arguments[i]); ++i) {
						key = moduleKeys[i];

						// want to keep original config intact to avoid any confusing changes in configuration keys;
						// also want to add a reference to the app first (so it is set before others)
						config = lang.mixin({ app: self }, self.modules[key]);

						// do not want to pass the 'moduleId' key to the module since it is supposed to be used only by
						// Application to find the component, but it would be cool if it made its way to declaredClass
						// for debugging.
						config.declaredClass = config.moduleId;
						delete config.moduleId;

						module = new Module(config);
						self.set(key, module);

						if (key === 'ui') {
							module.placeAt(config.placeAt || document.body);
						}
					}

					// Ensure all modules are in place before starting them up
					for (i = 0; (module = self.get(moduleKeys[i])); ++i) {
						module.startup && module.startup();
					}

					dfd.resolve();
				}
				catch (error) {
					dfd.reject(error);
					throw error;
				}
			});

			return dfd.promise;
		},

		loadController: function (/**string*/ moduleId) {
			//	summary:
			//		Destroys the current controller (if any) and starts up a new one.
			//	moduleId:
			//		The module ID of the controller to load.
			//	event:
			//		A dojo/router event.
			//	returns: dojo/promise/Promise
			//		A promise that resolves to the new controller after it has been started.

			var self = this,
				dfd = new Deferred(),
				contentNode = this.ui.contentNode;

			// TODO: Use destroy instead?
			// TODO: Use this.own?
			this.controller && this.controller.destroyRecursive();

			require([ moduleId ], function (Controller) {
				var controller = new Controller({
					app: self
				}).placeAt(contentNode);
				// Don't need to call startup; _WidgetBase in 1.8 already will because
				// it sees a parent widget

				self.set('controller', controller);
				dfd.resolve(controller);
			});

			return dfd.promise;
		},

		startup: function () {
			//	summary:
			//		Starts the application.
			//	returns: dojo/promise/Promise
			//		A promise that resolves once all application components have been loaded and started.

			var promise;

			this.startup = function () {
				return promise;
			};

			if (has('debug')) {
				this.on('error', function (event) {
					console.error(event.error);
				});
			}

			return promise = this._loadModules();
		}
	});
});