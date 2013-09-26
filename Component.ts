/// <reference path="interfaces.ts" />

class Component {
	get(key:string):any {

	}

	set(options:Object);
	set(key:string, value:any):void {

	}

	watch(callback:(value:any, oldValue:any, key:string) => void):IHandle;
	watch(key:string, callback:(value:any, oldValue:any, key:string) => void):IHandle {

	}
}
