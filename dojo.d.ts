/// <reference path="interfaces.ts" />

interface IStateful {
	new (kwArgs:Object);
	get(key:string):any;
	set(kwArgs:Object):void;
	set(key:string, value:any):void;
	watch(key:string, callback:(key:string, oldValue:any, newValue:any) => void):IHandle;
	watch(callback:(key:string, oldValue:any, newValue:any) => void):IHandle;
}

interface IPromise {
	cancel(reason:any, strict?:boolean):any;
	then(callback:(value:any) => any, errback:(error:Error) => any, progback:(update:any) => any):IPromise;
	otherwise(errback:(error:Error) => any):IPromise;
	always(callback:(valueOrError:any) => any):IPromise;
	isResolved():boolean;
	isRejected():boolean;
	isFulfilled():boolean;
	isCanceled():boolean;
}

interface IDeferred extends IPromise {
	new (canceler:(reason:any) => any);

	resolve(value:any, strict?:boolean):IPromise;
	reject(error:Error, strict?:boolean):IPromise;
	progress(update:any, strict?:boolean):IPromise;
}

declare module 'dojo/_base/array' {
	var array:{
		forEach<T>(array:T[], callback:(value:T, index:number, array:T[]) => void, thisArg?:any): void;
		map<T>(array:T[], callback:(value:T, index:number, array:T[]) => T, thisArg?:any):T[];
		filter<T>(array:T[], callback:(value:T, index:number, array:T[]) => boolean, thisArg?:any):T[];
		every<T>(array:T[], callback:(value:T, index:number, array:T[]) => boolean, thisArg?:any):boolean;
		some<T>(array:T[], callback:(value:T, index:number, array:T[]) => boolean, thisArg?:any):boolean;
		indexOf<T>(array:T[], value:T, fromIndex?:number, findLast?:boolean):number;
		lastIndexOf<T>(array:T[], value:T, fromIndex?:number):number;
	};
	export = array;
}

declare module 'dojo/_base/declare' {
	var decl:{
		(superclass:Function, properties:Object):any;
		(superclass:Function[], properties:Object):any;
		safeMixin(target:Object, source:Object):any;
	};

	export = decl;
}

declare module 'dojo/_base/lang' {
	var lang:{
		mixin<T>(target:T, ...source:Object[]):T;
		getObject(key:string, create?:boolean, context?:Object):any;
		setObject(key:string, value:any, context?:Object):any;
		hitch<T>(context:Object, fn:T): T;
		hitch(context:Object, property:string, ...prefixedArgs:Object[]):Function;
		hitch(context:Object, fn:Function, ...prefixedArgs:Object[]):Function;
		partial<T>(fn:T): T;
		partial(fn:Function, ...prefixedArgs:any[]): Function;
		delegate<T>(object:T, properties?:Object):T;
		trim(string:string):string;
		replace(template:string, kwArgs:Object, pattern?:RegExp):string;
	};
	export = lang;
}

declare module 'dojo/Deferred' {
	var Deferred:IDeferred;
	export = Deferred;
}

declare module 'dojo/has' {
	var has:{
		(feature:string):any;
		add(feature:string, value:any):void;
	};
	export = has;
}

declare module 'dojo/Stateful' {
	var Stateful:IStateful;
	export = Stateful;
}
