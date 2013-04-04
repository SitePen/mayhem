define([
	'dojo/_base/declare',
	'dojo/Deferred',
	'dojo/when',
	'./BaseRoute',
	'require'
], function (declare, Deferred, when, BaseRoute, require) {
	// TODO: Rename BaseRoute to Route and rename this guy to PathRoute or something?

	return declare(BaseRoute, {
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

		enter: function () {
			//	summary:
			//		Activates this route, instantiating view and controller components and placing them into any
			//		parent route's view.

			var self = this,
				dfd = new Deferred();

			require([
				this._resolveModuleId('view'),
				this._resolveModuleId('controller')
			], function (View, Controller) {
				return when(self._instantiateComponents(View, Controller)).then(function () {
					dfd.resolve();
				}, function () {
					dfd.reject();
				});
			});

			return dfd.promise;
		},

		exit: function () {
			//	summary:
			//		Deactivates the route, disconnecting any subviews within the route's view and removing the view
			//		from its parent.

			var handle;
			while((handle = this._subViewHandles.pop())) {
				handle.remove();
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