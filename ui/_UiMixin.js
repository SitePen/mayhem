define([
	'dojo/_base/declare',
	'dojo/_base/lang',
	'dojo/promise/all',
	'dojo/router',
	'dojo/hash'
], function (declare, lang, whenAll, router, hash) {
	return declare(null, {
		//	homeId: string
		//		The view to treat as a starting view. This view will have
		//		the hash of views passed to its `init()` function if it
		//		exists.
		homeId: 'home',

		//	defaultViewId: string
		//		The view to navigate to when no hash is given.
		defaultViewId: 'home',

		_viewClass: null,
		_currentView: null,

		init: function (config) {
			//	summary:
			//		Initialize the UI instance with a configuration object. This
			//		object defines views and other properties of the UI.
			this.views = {};

			if (config.defaultViewId) {
				this.defaultViewId = config.defaultViewId;
			}

			var readyPromises = [],
				viewConfigs = config.views.slice(0);

			if (config.home) {
				this.homeId = config.home.id;
				viewConfigs.unshift(lang.delegate(config.home, {
					loadImmediately: true
				}));
			}

			for (var i = 0, viewConfig; (viewConfig = viewConfigs[i]); i++) {
				var view = this.views[viewConfig.id] = this.addView(viewConfig, config.require);

				if (viewConfig.loadImmediately) {
					readyPromises.push(view.loadContent());
				}
			}

			return whenAll(readyPromises).then(lang.hitch(this, 'startup'));
		},

		addView: function (viewConfig, configRequire) {
			//	summary:
			//		Creates and returns a lazy view. This method should be overridden in
			//		subclasses to actually add the view to the UI.
			var View = this._viewClass,
				viewId = viewConfig.id;

			return new View({
				id: viewId + 'Container',
				require: configRequire || require,
				title: viewConfig.title,
				viewId: viewId,
				viewArgs: viewConfig.viewArgs,
				moduleId: viewConfig.moduleId
			});
		},

		selectView: function (view) {
			//	summary:
			//		Select a view. This method should be overridden in subclasses to
			//		actually select a view in the UI.
			this._currentView = view;
		},

		startup: function () {
			//	summary:
			//		Called when all lazy views that should be loaded are loaded. When
			//		used as a mixin to a widget, this will also initialize the widget.
			if (this._started) {
				return;
			}

			this.inherited(arguments);

			var views = this.views;
			if (this.homeId) {
				this.views[this.homeId].loadContent().then(function (home) {
					home.init && home.init(views);
				});
			}

			if (!hash()) {
				hash('/' + this.defaultViewId, true);
			}

			for (var viewId in views) {
				if (viewId === this.defaultViewId) {
					this.selectView(views[viewId]);
				}
			}

			var route = lang.hitch(this, 'route');

			this._registeredRoutes = [
				router.register('/:viewId', route),
				router.register('/:viewId/*rest', route)
			];
			router.startup();
		},

		destroy: function () {
			var route;
			while ((route = this._registeredRoutes.pop())) {
				route.remove();
			}
			this.inherited(arguments);
		},

		route: function (event) {
			//	summary:
			//		Route a dojo/router event. When the hash changes, this
			//		will select the correct view based on ID. If the view
			//		does not exist, the event will be prevented.
			var newViewId = event.params.viewId,
				rest = event.params.rest;

			if (!(newViewId in this.views)) {
				event.preventDefault();
				return;
			}

			this.selectView(this.views[newViewId]);

			if (newViewId !== this.homeId) {
				var self = this;
				this._currentView.loadContent().then(function (content) {
					self.routeView(content, newViewId, rest);
				});
			}
		},

		routeView: function (view, viewId, rest) {
			//	summary:
			//		Pass hash information from the UI to the selected view.
			//
			//TODO: figure out hash parsing so views can register hashes and don't have to parse it themselves
			if (!view.route) {
				console.warn('Content for view ' + viewId + ' does no routing');
			}
			else {
				view.route(rest);
			}
		}
	});
});
