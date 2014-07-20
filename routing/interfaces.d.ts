import Application = require('../Application');
import core = require('../interfaces');
import Observable = require('../Observable');
import RouteEvent = require('./RouteEvent');

/**
 * Root interface for routes
 */
export interface IRoute {
	get:IRouteGet;
	enter(event:RouteEvent):void;
	exit():void;
	set:IRouteSet;
	startup():IPromise<IRoute>;
}

export interface IRouteGet extends Observable.Getters {
	(key:'router'):IRouter;
}

export interface IRouteSet extends Observable.Setters {
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
	(key:'app'):Application;
	(key:'defaultRoute'):string;
	(key:'notFoundRoute'):string;
}

export interface IRouterSet extends core.IApplicationComponentSet {
	(key:'app', value:Application):void;
	(key:'defaultRoute', value:string):void;
	(key:'notFoundRoute', value:string):void;
}
