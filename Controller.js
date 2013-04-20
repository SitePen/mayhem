define([
	'dojo/_base/declare',
	'./Component'
], function (declare, Component) {
	return declare(Component, {
		_generateRouteId: function (/**string*/ routeId) {
			//	summary:
			//		Generates a route ID relative to the current route for this controller.
			//	returns: string
			//		A route ID.

			if (routeId.charAt(0) === '/') {
				routeId = routeId.slice(1);
			}
			else {
				routeId = (this.routeState.id + '/' + routeId).split('/');

				for (var i = routeId.length - 1, part; i >= 0; --i) {
					part = routeId[i];
					if (part === '.') {
						routeId.splice(i, 1);
					}
					else if (part === '..') {
						if (i < 1) {
							throw new Error('Cannot generate a route above the root');
						}
						routeId.splice(--i, 2);
					}
				}
				routeId = routeId.join('/');
			}

			return routeId;
		},

		createPath: function (/**string*/ routeId, /**Object*/ kwArgs) {
			//	summary:
			//		Generates a path to a route relative to the current route for this controller.
			//	routeId:
			//		A relative route ID that will be appended to the current route, or an absolute route ID starting
			//		with a forward-slash.
			//	returns: string

			return this.app.get('router').createPath(this._generateRouteId(routeId), kwArgs);
		},

		go: function (/**string*/ routeId, /**Object*/ kwArgs) {
			//	summary:
			//		Goes to a new route using a route ID relative to the current route for this controller.
			//	routeId:
			//		A relative route ID that will be appended to the current route, or an absolute route ID starting
			//		with a forward-slash.

			this.app.get('router').go(this._generateRouteId(routeId), kwArgs);
		}
	});
});