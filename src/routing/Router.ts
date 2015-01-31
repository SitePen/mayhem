import Application = require('../Application');
import arrayUtil = require('dojo/_base/array');
import Observable = require('../Observable');
import Promise = require('../Promise');
import Request = require('./Request');
import RoutingError = require('./RoutingError');
import UrlRule = require('./UrlRule');
import util = require('../util');

class Router extends Observable {
	get:Router.Getters;
	set:Router.Setters;

	protected _routeInProgress:Promise<void>;

	protected _rules:UrlRule[];
	protected _rulesGetter() {
		return this._rules;
	}
	protected _rulesSetter(value:any[]) {
		this._rules = arrayUtil.map(value, function (rule:any):UrlRule {
			if (rule.constructor === Object) {
				return new UrlRule(rule);
			}

			return rule;
		});

		// The empty default rule allows links to any valid route without each needing their own URL rule
		this._rules.push(new UrlRule());
	}

	createUrl(routeId:string, kwArgs?:{}) {
		var rules:UrlRule[] = this.get('rules');
		var serialized:string;

		if (this.get('routes')[routeId]) {
			for (var i = 0, rule:UrlRule; (rule = rules[i]); ++i) {
				serialized = rule.serialize(routeId, kwArgs);
				if (serialized) {
					return serialized;
				}
			}
		}

		throw new Error('Invalid route');
	}

	destroy() {
		super.destroy();

		var currentRoute = this.get('currentRoute');
		if (currentRoute) {
			currentRoute.destroy();
		}
	}

	go(routeId:string, kwArgs?:{}):Promise<void> {
		return this._goToRoute({
			routeId: routeId,
			kwArgs: kwArgs
		});
	}

	protected _goToRoute(routeInfo:Router.RouteInfo) {
		var self = this;
		var oldRoute:Router.Route = this.get('currentRoute');

		this._routeInProgress && this._routeInProgress.cancel();
		var promise = this
			._loadRoute(routeInfo.routeId)
			.then(function (newRoute) {
				if (newRoute === oldRoute) {
					return newRoute.update && newRoute.update(routeInfo.kwArgs);
				}

				return Promise.resolve(oldRoute && oldRoute.beforeExit && oldRoute.beforeExit(routeInfo.kwArgs))
					.then(function () {
						return newRoute.beforeEnter && newRoute.beforeEnter(routeInfo.kwArgs);
					})
					.then(function () {
						return oldRoute && oldRoute.exit && oldRoute.exit(routeInfo.kwArgs);
					})
					.then(function () {
						self.set('currentRoute', null);
						return newRoute.enter(routeInfo.kwArgs);
					})
					.then(function () {
						self._routeInProgress = null;
						self.set('currentRoute', newRoute);
					});
			})
			.otherwise(function (error) {
				self._routeInProgress = null;
				if (error.name !== 'CancelError') {
					throw error;
				}
			});

		this._routeInProgress = promise;
		return promise;
	}

	protected _handleRequest(request:Request):Promise<void> {
		var self = this;

		// Wrapped in a promise for automatic rejection if _parseRequest throws
		return new Promise<void>(function (resolve) {
			var routeInfo:Router.RouteInfo = self._parseRequest(request);
			resolve(self._goToRoute(routeInfo));
		});
	}

	_initialize() {
		super._initialize();
		this._rules = [ new UrlRule() ];
	}

	protected _loadRoute(routeId:string):Promise<Router.Route> {
		var self = this;
		var routes:HashMap<any> = this.get('routes');
		var route:any = routes[routeId];
		if (!route) {
			throw new Error('Invalid route ID "' + routeId + '"');
		}

		if (typeof route === 'string') {
			return util.getModule(route).then(function (Ctor:{ new (...args:any[]):Router.Route; }) {
				routes[routeId] = new Ctor({
					app: self.get('app')
				});
				return routes[routeId];
			});
		}

		return Promise.resolve(route);
	}

	protected _parseRequest(request:Request) {
		var rules:UrlRule[] = this.get('rules');
		var routeInfo:Router.RouteInfo;

		for (var i = 0, rule:UrlRule; (rule = rules[i]); ++i) {
			routeInfo = rule.parse(request);
			if (routeInfo) {
				return routeInfo;
			}
		}

		throw new RoutingError('Request did not match any known URL', request);
	}
}

module Router {
	export interface Getters extends Observable.Getters {
		(key:'app'):Application;
		(key:'currentRoute'):Route;
		(key:'defaultRoute'):RouteInfo;
		(key:'routes'):HashMap<any>;
		(key:'rules'):UrlRule[];
	}

	export interface RouteInfo {
		routeId:string;
		kwArgs?:{};
	}

	export interface Route {
		beforeEnter?(kwArgs:{}):Promise<void>;
		beforeEnter?(kwArgs:{}):void;
		beforeExit?(kwArgs:{}):Promise<void>;
		beforeExit?(kwArgs:{}):void;
		destroy():void;
		enter(kwArgs:{}):Promise<void>;
		enter(kwArgs:{}):void;
		exit?(kwArgs:{}):Promise<void>;
		exit?(kwArgs:{}):void;
		update?(kwArgs:{}):Promise<void>;
		update?(kwArgs:{}):void;
	}

	export interface Setters extends Observable.Setters {
		(key:'defaultRoute', value:RouteInfo):void;
		(key:'routes', value:HashMap<any>):void;
		(key:'rules', value:UrlRule[]):void;
	}
}

export = Router;
