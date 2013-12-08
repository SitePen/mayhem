interface IHandle {
	remove: () => void;
}

interface IStateful {
	get(key:string):any;
	set(kwArgs:Object):void;
	set(key:string, value:any):void;
	watch(callback:(key:string, oldValue:any, newValue:any) => void):IHandle;
	watch(key:string, callback:(key:string, oldValue:any, newValue:any) => void):IHandle;
}

interface IPromise<T> {
	cancel<U>(reason:U, strict?:boolean):U;
	then<U>(callback:(value:T) => IPromise<U>, errback?:(reason:any) => IPromise<U>, progback?:(update:any) => IPromise<U>):IPromise<U>;
	then<U>(callback:(value:T) => IPromise<U>, errback?:(reason:any) => U,           progback?:(update:any) => IPromise<U>):IPromise<U>;
	then<U>(callback:(value:T) => U,           errback?:(reason:any) => IPromise<U>, progback?:(update:any) => IPromise<U>):IPromise<U>;
	then<U>(callback:(value:T) => U,           errback?:(reason:any) => U,           progback?:(update:any) => IPromise<U>):IPromise<U>;
	then<U>(callback:(value:T) => IPromise<U>, errback?:(reason:any) => IPromise<U>, progback?:(update:any) => U):IPromise<U>;
	then<U>(callback:(value:T) => IPromise<U>, errback?:(reason:any) => U,           progback?:(update:any) => U):IPromise<U>;
	then<U>(callback:(value:T) => U,           errback?:(reason:any) => IPromise<U>, progback?:(update:any) => U):IPromise<U>;
	then<U>(callback:(value:T) => U,           errback?:(reason:any) => U,           progback?:(update:any) => U):IPromise<U>;
	otherwise<U>(errback:(reason:any) => IPromise<U>):IPromise<U>;
	otherwise<U>(errback:(reason:any) => U):IPromise<U>;
	always<U>(callback:(valueOrError:any) => U):IPromise<U>;
	isResolved():boolean;
	isRejected():boolean;
	isFulfilled():boolean;
	isCanceled():boolean;
}

interface IDeferred<T> extends IPromise<T> {
	promise:IPromise<T>;
	resolve<U>(value:U, strict?:boolean):IPromise<U>;
	reject<U>(reason:U, strict?:boolean):IPromise<U>;
	progress<U>(update:U, strict?:boolean):IPromise<U>;
}

interface IExtensionEvent {
	(target:Object, callback:(event:Event) => void):IHandle;
}

interface IEvented {
	on(type:IExtensionEvent, listener:(event:Event) => void):IHandle;
	on(type:string, listener:(event:Event) => void):IHandle;
	emit(type:string, event:Event):void;
}

declare var require:{
	(config:Object, dependencies:string[], callback:(...modules:any[]) => void);
	(dependencies:string[], callback:(...modules:any[]) => void);
};

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
		(superclass:any, properties?:Object):new () => any;
		(superclass:any[], properties?:Object):new () => any;
		safeMixin<T>(target:T, source:Object):T;
	};

	export = decl;
}

declare module 'dojo/_base/lang' {
	var lang:{
		mixin<T>(target:T, ...source:Object[]):T;
		getObject(key:string, create?:boolean, context?:Object):any;
		setObject(key:string, value:any, context?:Object):any;
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
	var Deferred:{
		new (canceler:(reason:any) => any):IDeferred<any>;
		when<T>(value:T):IPromise<T>;
		when<T>(value:IPromise<T>):IPromise<T>;
		when<T,U>(valueOrPromise:T, callback?:(value:T) => IPromise<U>):IPromise<U>;
		when<T,U>(valueOrPromise:T, callback?:(value:T) => U):IPromise<U>;
	};
	export = Deferred;
}

declare module 'dojo/Evented' {
	class Evented implements IEvented {
		on(type:(target:any, listener:(event:Event) => void) => void, listener:(event:Event) => void):IHandle;
		on(type:string, listener:(event:Event) => void):IHandle;
		emit(type:string, event:Event):void;
	}

	export = Evented;
}

declare module 'dojo/has' {
	var has:{
		(feature:string):any;
		add(feature:string, value:any):void;
	};
	export = has;
}

declare module 'dojo/promise/all' {
	var all:{
		(object:Object):IPromise<Object>;
		<T>(array:T[]):IPromise<T[]>;
	};
	export = all;
}

declare module 'dojo/request/util' {
	var util:{
		deepCopy<T>(target:T, source:Object):T;
		deepCreate<T>(source:T, properties:Object):T;
		deferred(response:Object /*IResponseObject*/, cancel:Function /*Canceller*/, isValid:boolean, isReady:boolean, handleResponse:any, last:Function);
		addCommonMethods(provider:any, methods:string[]):void;
		parseArgs(url, options, skipData):{ url:string; options:string; getHeader:(name:string) => string; };
		checkStatus(status:number):boolean;
	};
	export = util;
}

declare module 'dojo/Stateful' {
	class Stateful implements IStateful {
		constructor(kwArgs:Object);
		get(key:string):any;
		set(kwArgs:Object):void;
		set(key:string, value:any):void;
		watch(callback:(key:string, oldValue:any, newValue:any) => void):IHandle;
		watch(key:string, callback:(key:string, oldValue:any, newValue:any) => void):IHandle;
	}

	export = Stateful;
}

declare module 'dojo/when' {
	var when:{
		<T>(value:T):IPromise<T>;
		<T>(value:IPromise<T>):IPromise<T>;
		<T,U>(valueOrPromise:T, callback?:(value:T) => IPromise<U>):IPromise<U>;
		<T,U>(valueOrPromise:T, callback?:(value:T) => U):IPromise<U>;
	};
	export = when;
}
