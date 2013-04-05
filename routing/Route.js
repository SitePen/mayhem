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

		//	view: string|null
		//		The name of a view which, when transformed using the expression
		//		`router.viewPath + '/' + toUpperCamelCase(route.view) + 'View'`,
		//		provides a module ID that points to a module whose value is a `framework/View`.
		//		If the string starts with a `/`, it will be treated as an absolute module ID and not transformed.
		//		If null, a generic View object will be used for this route instead.
		view: null,

		//	controller: string
		//		The name of a controller which, when transformed using the expression
		//		`router.controllerPath + '/' + toUpperCamelCase(route.controller) + 'Controller'`,
		//		provides a module ID that points to a module whose value is a `framework/Controller`.
		//		If the string starts with a `/`, it will be treated as an absolute module ID and not transformed.
		//		If null, a generic Controller object will be used for this route instead.
		controller: null,

		//	router: framework/routing/Router
		//		The router to which this route belongs.
		router: null,

		_subViewHandles: null,

		constructor: function () {
			this._subViewHandles = [];
		},

		_resolveModuleId: function (/**string*/ property) {
			//	summary:
			//		Converts view and controller shorthand module references to a valid module ID.
			//	returns: string

			var value = this[property];

			if (value === null) {
				return 'framework/' + property.charAt(0).toUpperCase() + property.slice(1);
			}

			return value.charAt(0) === '/' ? value.slice(1) :
				this.router.get(property + 'Path') + '/' +
				value.charAt(0).toUpperCase() + value.slice(1) + property.charAt(0).toUpperCase() + property.slice(1);
		},

		enter: function (event) {
			//	summary:
			//		Activates this route, instantiating view and controller components and placing them into any
			//		parent route's view.

			function setRouteInfo(event) {
				var kwArgs = {};

				for (var k in self) {
					// Custom properties on the route should be provided to the controller, but not private or
					// default properties since those are only relevant to the route itself
					if (k.charAt(0) === '_' || (k in self.constructor.prototype)) {
						continue;
					}

					kwArgs[k] = self[k];
				}

				lang.mixin(kwArgs, self.parse(event.newPath));

				has('debug') && console.log('new route info', kwArgs);
				self._controllerInstance.set('routeInfo', kwArgs);
				return dfd.promise;
			}

			has('debug') && console.log('entering', this.id);

			var self = this,
				dfd = new Deferred();

			require([
				this._resolveModuleId('view'),
				this._resolveModuleId('controller')
			], function (View, Controller) {
				return when(self._instantiateComponents(View, Controller)).then(function () {
					setRouteInfo(event);
					dfd.resolve();
				}, function () {
					dfd.reject();
				});
			});

			this.enter = setRouteInfo;

			return dfd.promise;
		},

		exit: function () {
			//	summary:
			//		Deactivates the route, disconnecting any subviews within the route's view and removing the view
			//		from its parent.

			has('debug') && console.log('exiting', this.id);

			var handle;
			while((handle = this._subViewHandles.pop())) {
				handle.remove();
			}
		},

		destroy: function () {
			this.inherited(arguments);

			if (this._viewInstance) {
				this._viewInstance.destroyRecursive();
				this._controllerInstance.destroy && this._controllerInstance.destroy();
			}
		},

		place: function (view, placeholderId) {
			return this._viewInstance.addSubView(view, placeholderId);
		},

		_instantiateComponents: function (View, Controller) {
			var controller = this._controllerInstance = new Controller();
			this._viewInstance = new View({ controller: controller });
			this._subViewHandles.push(this.parent.place(this._viewInstance, this.placeholder));

			return this._viewInstance.startup();
		}
	});
});