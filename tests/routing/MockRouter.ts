import core = require('../../interfaces');
import routing = require('../../routing/interfaces');

class MockRouter implements routing.IRouter {
	paused:boolean = false;
	path:string = null;
	pathReplaced:boolean = false;

	get:routing.IRouterGet;
	set:routing.IRouterSet;

	createPath(routeId:string, kwArgs?:Object):string {
		return null;
	}

	destroy():void {
	}

	go(routeId:string, kwArgs:Object):void {
	}

	normalizeId(routeId:string):string {
		return null;
	}

	observe(key:any, observer:core.IObserver<any>):IHandle {
		return null;
	}

	pause():void {
	}

	resetPath(path:string, replace?:boolean):void {
		this.path = path;
		this.pathReplaced = replace;
	}

	resume():void {
	}

	startup():IPromise<void> {
		return null;
	}
}

MockRouter.prototype.get = (key:string):any => null;
MockRouter.prototype.set = (key:any, value?:any):void => {};

export = MockRouter;
