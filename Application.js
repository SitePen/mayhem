define([
	'dojo/_base/lang',
	'dojo/_base/declare',
	'./has',
	'./Component',
	'dojo/Deferred',
	'dojo/promise/all',
	'dojo/request/util',
	'require'
], function (lang, declare, has, Component, Deferred, whenAll, util, require) {
	return declare(Component, {
		postscript: function (kwArgs) {
			//	summary:
			//		Replaces the configuration kwArgs object that gets passed to the constructor with one that
			//		includes defaults and reapplies properties to the application instance.

			this.set(util.deepCopy(this._getDefaultConfig(), kwArgs));
		},

		_getDefaultConfig: function () {
			// summary:
			//		Provides the default configuration for the application. This is a function instead of an object
			//		literal in order to allow subclasses to inherit and modify the default configuration, and to avoid
			//		using lang.clone when creating a copy of the config for a new instance of an application since it
			//		will attempt to blindly execute any `constructor` property it encounters.
			//	returns: Object

			return {
				modules: {
					router: {
						constructor: 'framework/routing/NullRouter'
					}
				}
			};
		},

		_loadModules: function () {
			//	summary:
			//		Loads application components and attaches them to the application object.
			//	tags:
			//		protected
			//	returns: dojo/promise/Promise
			//		A promise that is resolved once all components are loaded and attached.

			var self = this,
				dfd = new Deferred(),
				lazyConstructors = {},
				moduleIdsToLoad = [];

			for (var key in this.modules) {
				if (typeof this.modules[key].constructor === 'string') {
					lazyConstructors[key] = moduleIdsToLoad.push(this.modules[key].constructor) - 1;
				}
			}

			require(moduleIdsToLoad, function () {
				try {
					for (var key in self.modules) {
						// want to keep original config intact to avoid any confusing changes in original configuration;
						// also want to add a reference to the app first (so it is set before others)
						var config = lang.mixin({ app: self }, self.modules[key]);

						if (key in lazyConstructors) {
							config.constructor = arguments[lazyConstructors[key]];
						}

						var Module = config.constructor;

						// this will already come from the prototype
						delete config.constructor;

						self.set(key, new Module(config));
					}

					dfd.resolve();
				}
				catch (error) {
					dfd.reject(error);
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

		startup: function (/**Object*/ options) {
			//	summary:
			//		Starts the application.
			//	options:
			//		Startup options. Available properties are:
			//		* startModules (boolean, default: true) - Whether or not to start up injected modules automatically.
			//	returns: dojo/promise/Promise
			//		A promise that resolves once all application components have been loaded and started.

			if (has('debug')) {
				this.on('error', function (event) {
					console.error(event.error);
				});
			}

			var promise = this._loadModules();

			if (options.startModules !== false) {
				promise = promise.then(lang.hitch(this, 'startupModules'));
			}

			this.startup = function () {
				return promise;
			};

			return promise;
		},

		startupModules: function () {
			//	summary:
			//		Starts modules that were injected to the application object.
			//	returns: framework/Application
			//		The application instance.

			var self = this,
				promises = [],
				promise;

			for (var k in this.modules) {
				promise = this[k].startup && this[k].startup();
				if (promise && promise.then) {
					promises.push(promise);
				}
			}

			promise = whenAll(promises).then(function () {
				return self;
			});

			this.startupModules = function () {
				return promise;
			};

			return promise;
		}
	});
});