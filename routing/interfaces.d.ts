import core = require('../interfaces');
import RouteEvent = require('./RouteEvent');

/**
 * A route descriptor
 */
export interface IRouteDefinition {
	view?:string;
	controller?:string;
	path?:string;
	code?:number;
}

/**
 * Root interface for routes
 */
export interface IRoute {
	get(key:'router'):IRouter;
	get(key:string):any;
	set(key:'router', value:IRouter):void;
	set(key:string, value:any):void;

	enter(event:RouteEvent):IPromise<void>;
	exit():void;
}

/**
 * Root interface for routers
 */
export interface IRouter {
	get(key:'app'):core.IApplication;
	get(key:'defaultRoute'):string;
	get(key:'notFoundRoute'):string;
	get(key:string):any;

	set(key:'app', value:core.IApplication):void;
	set(key:'defaultRoute', value:string):void;
	set(key:'notFoundRoute', value:string):void;
	set(key:string, value:any):void;

	createPath:(routeId:string, kwArgs?:Object) => string;
	destroy:() => void;
	go:(routeId:string, kwArgs:Object) => void;
	normalizeId:(routeId:string) => string;
	pause:() => void;
	resetPath:(path:string, replace?:boolean) => void;
	resume:() => void;
	startup:() => IPromise<void>;
}
