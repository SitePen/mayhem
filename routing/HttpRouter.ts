import server = require('jsgi-node');
import lang = require('dojo/_base/lang');
import Promise = require('../Promise');
import BaseRequest = require('./Request');
import Router = require('./Router');
import RoutingError = require('./RoutingError');

class HttpRouter extends Router {
	protected _server:server.IHttpServer;

	get:HttpRouter.Getters;
	set:HttpRouter.Setters;

	destroy():void {
		this._server.close();
	}

	_handleRequest(request:HttpRouter.Request):Promise<HttpRouter.Response> {
		var self = this;
		var path = request.path = request.pathInfo;

		function updateRequest(routeInfo:Router.RouteInfo):void {
			lang.mixin(request, routeInfo.kwArgs || {});
			request.pathInfo = request.path;
		}
		var defaultRoute = this.get('defaultRoute');
		if (!path || path === '/' && defaultRoute) {
			updateRequest(defaultRoute);
			return this._loadRoute(defaultRoute.routeId).then(function (route) {
				return route(request);
			});
		}

		return new Promise<Router.RouteInfo>(function (resolve) {
			resolve(self._parseRequest(request));
		}).then(function (routeInfo:Router.RouteInfo) {
			updateRequest(routeInfo);
			return self._loadRoute(routeInfo.routeId);
		}).then(function (route:Router.Route) {
			return route(request);
		}).otherwise(function(error:Error) {
			return {
				status: error instanceof RoutingError ? 404 : 500,
				headers: {},
				body: [ error.message ]
			};
		});
	}

	run():void {
		this._server = server.start(this._handleRequest.bind(this), { port: 9090 });
	}
}

module HttpRouter {
	export interface Getters extends Router.Getters {
	}
	export interface Setters extends Router.Setters {
	}
	export interface Request extends BaseRequest, server.IHttpRequest {
	}
	export interface Response extends server.IHttpResponse {
	}
}

export = HttpRouter;
