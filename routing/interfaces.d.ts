import core = require('../interfaces');

/**
 * The IRoute interface
 */
export interface IRoute {
	router:IRouter;
}

/**
 * The IRouter interface
 */
export interface IRouter {
	createPath:(routeId:string, kwArgs?:{ [key:string]: any }) => string;
	defaultRoute:string;
	destroy:() => void;
	go:(routeId:string, kwArgs:Object) => void;
	normalizeId:(routeId:string) => string;
	notFoundRoute:string;
	pause:() => void;
	resetPath:(path:string, replace?:boolean) => void;
	resume:() => void;
	startup:() => IPromise<void>;
}
