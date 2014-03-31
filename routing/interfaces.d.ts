import core = require('../interfaces');
import RouteEvent = require('./RouteEvent');

/**
 * Root interface for routes
 */
export interface IRoute {
	get:IRouteGet;
	enter(event:RouteEvent):IPromise<void>;
	exit():void;
	set:IRouteSet;
}

export interface IRouteGet extends core.IObservableGet {
	(key:'router'):IRouter;
}

export interface IRouteSet extends core.IObservableSet {
	(key:'router', value:IRouter):void;
}

/**
 * Root interface for routers
 */
export interface IRouter extends core.IApplicationComponent {
	createPath:(routeId:string, kwArgs?:Object) => string;
	destroy:() => void;
	get:IRouterGet;
	go:(routeId:string, kwArgs:Object) => void;
	normalizeId:(routeId:string) => string;
	pause:() => void;
	resetPath:(path:string, replace?:boolean) => void;
	resume:() => void;
	set:IRouterSet;
	startup:() => IPromise<void>;
}

export interface IRouterGet extends core.IApplicationComponentGet {
	(key:'app'):core.IApplication;
	(key:'defaultRoute'):string;
	(key:'notFoundRoute'):string;
}

export interface IRouterSet extends core.IApplicationComponentSet {
	(key:'app', value:core.IApplication):void;
	(key:'defaultRoute', value:string):void;
	(key:'notFoundRoute', value:string):void;
}
