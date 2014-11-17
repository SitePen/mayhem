import core = require('../interfaces');
import RouteEvent = require('./RouteEvent');

export interface IRoute extends core.IObservable {
	get:IRoute.Getters;
	enter(event:RouteEvent):void;
	exit(event:RouteEvent):void;
	set:IRoute.Setters;
	run():IPromise<void>;
}

export declare module IRoute {
	export interface Getters extends core.IObservable.Getters {
		(key:'app'):core.IApplication;
		(key:'parent'):IRoute;
		(key:'router'):IRouter;
	}

	export interface Setters extends core.IObservable.Setters {
		(key:'app', value:core.IApplication):void;
		(key:'router', value:IRouter):void;
	}
}

export interface IRouter extends core.IObservable {
	createPath(routeId:string, kwArgs?:Object):string;
	destroy():void;
	get:IRouter.Getters;
	go(routeId:string, kwArgs:Object):void;
	normalizeId(routeId:string):string;
	pause():void;
	resetPath(path:string, replace?:boolean):void;
	resume():void;
	set:IRouter.Setters;
	run():IPromise<void>;
}

export declare module IRouter {
	export interface Getters extends core.IObservable.Getters {
		(key:'app'):core.IApplication;
		(key:'defaultRoute'):string;
		(key:'notFoundRoute'):string;
	}

	export interface Setters extends core.IObservable.Setters {
		(key:'app', value:core.IApplication):void;
		(key:'defaultRoute', value:string):void;
		(key:'notFoundRoute', value:string):void;
	}
}
