import Application from '../Application';
import Base from '../Base';
import { getModule } from '../util';
import Promise from '../Promise';
import Request from './Request';
import RoutingError from './RoutingError';
import UrlRule from './UrlRule';

class Router extends Base {
	/**
	 * @readonly
	 */
	currentRoute: Router.Route;

	defaultRoute: Router.RouteInfo;

	routes: HashMap<string | Router.Route>;

	private _rules: UrlRule[];
	get rules(): Array<UrlRule | UrlRule.KwArgs> {
		return this._rules;
	}
	set rules(value: Array<UrlRule | UrlRule.KwArgs>) {
		this._rules = value.map(function (rule: UrlRule | UrlRule.KwArgs): UrlRule {
			if (rule.constructor === Object) {
				return new UrlRule(rule);
			}

			return <UrlRule> rule;
		});

		// The empty default rule allows links to any valid route without each needing their own URL rule
		this._rules.push(new UrlRule());
	}

	protected routeInProgress: Promise<void>;

	constructor(kwArgs?: Router.KwArgs) {
		super(kwArgs);
	}

	protected initialize() {
		super.initialize();
		this._rules = [ new UrlRule() ];
	}

	createUrl(routeId: string, kwArgs?: {}) {
		var rules = <UrlRule[]> this.rules;
		var serialized: string;

		if (this.routes[routeId]) {
			for (var i = 0, rule: UrlRule; (rule = rules[i]); ++i) {
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

		var currentRoute = this.currentRoute;
		if (currentRoute) {
			currentRoute.destroy();
		}
	}

	go(routeId: string, kwArgs?: {}): Promise<void> {
		return this.goToRoute({
			routeId,
			kwArgs
		});
	}

	protected goToRoute(routeInfo: Router.RouteInfo) {
		var self = this;
		var oldRoute = this.currentRoute;

		this.routeInProgress && this.routeInProgress.cancel();
		var promise = this
			.loadRoute(routeInfo.routeId)
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
						self.currentRoute = null;
						return newRoute.enter(routeInfo.kwArgs);
					})
					.then(function () {
						self.routeInProgress = null;
						self.currentRoute = newRoute;
					});
			})
			.catch(function (error) {
				self.routeInProgress = null;
				if (error.name !== 'CancelError') {
					throw error;
				}
			});

		this.routeInProgress = promise;
		return promise;
	}

	protected handleRequest(request: Request): Promise<void> {
		var self = this;

		// Wrapped in a promise for automatic rejection if parseRequest throws
		return new Promise<void>(function (resolve) {
			var routeInfo = self.parseRequest(request);
			resolve(self.goToRoute(routeInfo));
		});
	}

	protected loadRoute(routeId: string): Promise<Router.Route> {
		var self = this;
		var routes = this.routes;
		var route: string | Router.Route = routes[routeId];

		if (!route) {
			throw new Error('Invalid route ID "' + routeId + '"');
		}

		if (typeof route === 'string') {
			return getModule(route).then(function (Ctor: { new (...args: any[]): Router.Route; }) {
				routes[routeId] = new Ctor({
					app: self.app
				});
				return routes[routeId];
			});
		}

		return Promise.resolve(route);
	}

	protected parseRequest(request: Request): Router.RouteInfo {
		var rules = <UrlRule[]> this.rules;
		var routeInfo: Router.RouteInfo;

		for (var i = 0, rule: UrlRule; (rule = rules[i]); ++i) {
			routeInfo = rule.parse(request);
			if (routeInfo) {
				return routeInfo;
			}
		}

		throw new RoutingError('Request did not match any known URL', request);
	}
}

module Router {
	export interface KwArgs extends Base.KwArgs {
		defaultRoute?: typeof Router.prototype.defaultRoute;
		routes?: typeof Router.prototype.routes;
		rules?: typeof Router.prototype.rules;
	}

	export interface RouteInfo {
		routeId: string;
		kwArgs?: {};
	}

	export interface Route {
		beforeEnter?(kwArgs: {}): Promise<void> | void;
		beforeExit?(kwArgs: {}): Promise<void> | void;
		destroy(): void;
		enter(kwArgs: {}): Promise<void> | void;
		exit?(kwArgs: {}): Promise<void> | void;
		update?(kwArgs: {}): Promise<void> | void;
	}
}

export = Router;
