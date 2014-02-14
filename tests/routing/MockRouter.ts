import routing = require('../../routing/interfaces');

class MockRouter implements routing.IRouter {
	paused:boolean = false;
	path:string = null;
	pathReplaced:boolean = false;

	get(key:string):any {
		return null;
	}

	set(key:string, value:any):void {
	}

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

export = MockRouter;
