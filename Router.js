define([
	'dojo/_base/declare',
	'dojo/_base/lang',
	'dojo/router',
	'dojo/io-query',
	'./Component',
	'./Route'
], function (declare, lang, router, ioQuery, Component, Route) {
	return declare(Component, {
		//	defaultRoute: String?
		//		Specifies default route to navigate to if no hash is initially set.

		//	routes: Array
		//		Array of arrays; each inner array contains 2 items, the first being
		//		a string or RegExp for the pattern to register, and the second being
		//		the module id of the controller to load.

		_routesSetter: function (routes) {
			// TODO: Should be a StatefulArray
			var _routes = [];

			for (var i = 0, j = routes.length, route; i < j; ++i) {
				if (!(route instanceof Route)) {
					route = new Route(typeof route === 'string' ? { path: route } : route);
				}

				_routes.push(route);
			}

			this._routes = _routes;
		},

		createUrl: function (path, params) {
			params = ioQuery.objectToQuery(params);
			params = params ? '?' + params : '';

			return '#' + path + params;
		},

		startup: function () {
			router.startup();

			// Go to default route if one is set and no hash is initially present
			if (location.hash.length < 2 && this.defaultRoute) {
				router.go(this.defaultRoute);
			}
		}
	});
});