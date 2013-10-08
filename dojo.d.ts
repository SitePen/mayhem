/// <reference path="interfaces.ts" />

interface IStateful {
	get(key:string):any;
	set(kwArgs:Object):void;
	set(key:string, value:any):void;
	watch(callback:(key:string, oldValue:any, newValue:any) => void):IHandle;
	watch(key:string, callback:(key:string, oldValue:any, newValue:any) => void):IHandle;
}

declare module 'dojo/_base/array' {
	var array:{
		forEach(Array, callback:(value:any, index?:number, array?:Array) => void, thisArg?:any): void;
	};
	export = array;
}

declare module 'dojo/_base/lang' {
	var lang:{
		partial<T>(fn:T): T;
		partial(fn:Function, ...prefixedArgs:any[]): Function;
		hitch<T>(thisArg:any, fn:T): T;
		hitch(thisArg:any, fn:Function, ...prefixedArgs:any[]): Function;
		mixin<T>(destination:T, ...source:Object[]): T;
	};
	export = lang;
}

declare module 'dojo/has' {
	var has:(feature:string) => any;
	export = has;
}
