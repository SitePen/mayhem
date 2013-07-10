define([
	'dojo/_base/declare',
	'dojo/_base/lang',
	'dojo/Deferred',
	'dojo/when',
	'./BaseRoute',
	'../has',
	'require'
], function (declare, lang, Deferred, when, BaseRoute, has, require) {
	// TODO: Rename BaseRoute to Route and rename this guy to PathRoute or something?

	return declare(BaseRoute, {
		//	id: string
		//		The unique identifier for this route.
		id: null,

		//	parent: framework/routing/Route|framework/Application
		//		The parent route of this route. If no parent route exists, parent will be set to the main Application
		//		instance.
		parent: null,

		//	binder: string|null
		//		The name of a binder which, when transformed using the expression
		//		`router.binderPath + '/' + toUpperCamelCase(route.binder) + 'Binder'`,
		//		provides a module ID that points to a module whose value is a `framework/Binder`.
		//		If the string starts with a `/`, it will be treated as an absolute module ID and not transformed.
		//		If null, a generic Binder object will be used for this route instead.
		binder: null,

		//	view: string|null
		//		The name of a view which, when transformed using the expression
		//		`router.viewPath + '/' + toUpperCamelCase(route.view) + 'View'`,
		//		provides a module ID that points to a module whose value is a `framework/View`.
		//		If the string starts with a `/`, it will be treated as an absolute module ID and not transformed.
		//		If null, a generic View object will be used for this route instead.
		view: null,

		//	template: string
		//		The name of a template which, when transformed using the expression
		//		`router.viewPath + '/' + toUpperCamelCase(route.template) + 'View.html'`,
		//		provides a path to a Mayhem template.
		//		If the string starts with a '/', it will be treated as an absolute path and not transformed.
		template: null,

		//	placeholder: string
		//		The ID of the placeholder in the parent route's view that this route's view should be injected into.
		placeholder: 'default',

		//	router: framework/routing/Router
		//		The router to which this route belongs.
		router: null,

		_subViewHandles: null,

		constructor: function () {
			this._subViewHandles = [];
		},

		enter: function (/**framework/routing/RouteEvent*/ event) {
			//	summary:
			//		Activates this route, instantiating view and binder components and placing them into any
			//		parent route's view. Whenever a route is activated, state information from the route is provided
			//		to the binder by setting its `routeState` property.

			function setRouteState(event) {
				has('debug') && console.log('entering', self.id);

				var kwArgs = { id: self.id };

				for (var k in self) {
					// Custom properties on the route should be provided to the binder, but not private or
					// default properties since those are only relevant to the route itself
					if (k.charAt(0) === '_' || (k in self.constructor.prototype)) {
						continue;
					}

					kwArgs[k] = self[k];
				}

				lang.mixin(kwArgs, self.parse(event.newPath));

				has('debug') && console.log('new route state for', self.id, kwArgs);
				self._binderInstance.set('routeState', kwArgs);
				return dfd.promise;
			}

			has('debug') && console.log('preparing', this.id);

			var self = this,
				dfd = new Deferred();

			require([
				this.view,
				this.binder,
				this.template
			], function (View, Binder, TemplateConstructor) {
				return when(self._instantiateComponents(View, Binder, TemplateConstructor)).then(function () {
					setRouteState(event);
					dfd.resolve();
				}, function () {
					dfd.reject();
				});
			});

			this.enter = setRouteState;

			return dfd.promise;
		},

		exit: function () {
			//	summary:
			//		Deactivates the route, disconnecting any subviews within the route's view and removing the view
			//		from its parent.

			has('debug') && console.log('exiting', this.id);

			var handle;
			while ((handle = this._subViewHandles.pop())) {
				handle.remove();
			}
		},

		destroy: function () {
			this.inherited(arguments);

			if (this._viewInstance) {
				this._viewInstance.destroyRecursive();
				this._binderInstance.destroy && this._binderInstance.destroy();
			}
		},

		place: function (/**framework/View*/ view, /**string?*/ placeholderId) {
			//	summary:
			//		Places a sub-view into the view for this route at the placeholder given in `placeholderId`.
			//	view:
			//		The sub-view to place.
			//	placeholderId:
			//		The placeholder in which it should be placed. If not provided, defaults to `default`.

			return this._viewInstance.addSubView(view, placeholderId);
		},

		_instantiateComponents: function (View, Binder, TemplateConstructor) {
			var binder = this._binderInstance = new Binder({
				app: this.app
			});

			this._viewInstance = new View({
				app: this.app,
				TemplateConstructor: TemplateConstructor,
				binder: binder
			});

			this._subViewHandles.push(this.parent.place(this._viewInstance, this.placeholder));

			return this._viewInstance.startup();
		}
	});
});