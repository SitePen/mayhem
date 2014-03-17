// TODO: Not part of dojo, convenience type since the indexer was removed from Object
interface Object {
	[key:string]: any;
}

interface IDeferred<T> extends IPromise<T> {
	progress<U>(update:U, strict?:boolean):IPromise<U>;
	promise:IPromise<T>;
	reject<U>(reason:U, strict?:boolean):IPromise<U>;
	resolve<U>(value:U, strict?:boolean):IPromise<U>;
}

interface IEvented {
	emit(type:string, event?:Event):boolean;
	on(type:IExtensionEvent, listener:EventListener):IHandle;
	on(type:string, listener:EventListener):IHandle;
}

interface IExtensionEvent {
	(target:Object, callback:EventListener):IHandle;
}

interface IHandle {
	remove:() => void;
}

interface ILoaderPlugin {
	load(resourceId:string, contextRequire:typeof require, load:(...modules:any[]) => void):void;
	normalize?(resourceId:string, normalize:(id:string) => string):string;
}

interface IPromise<T> {
	always<U>(callback:(valueOrError:any) => U):IPromise<U>;
	cancel<U>(reason:U, strict?:boolean):U;
	isCanceled():boolean;
	isFulfilled():boolean;
	isRejected():boolean;
	isResolved():boolean;
	otherwise<U>(errback:(reason:any) => IPromise<U>):IPromise<U>;
	otherwise<U>(errback:(reason:any) => U):IPromise<U>;
	then<U>(callback:(value:T) => IPromise<U>, errback?:(reason:any) => IPromise<U>, progback?:(update:any) => IPromise<U>):IPromise<U>;
	then<U>(callback:(value:T) => IPromise<U>, errback?:(reason:any) => U,           progback?:(update:any) => IPromise<U>):IPromise<U>;
	then<U>(callback:(value:T) => U,           errback?:(reason:any) => IPromise<U>, progback?:(update:any) => IPromise<U>):IPromise<U>;
	then<U>(callback:(value:T) => U,           errback?:(reason:any) => U,           progback?:(update:any) => IPromise<U>):IPromise<U>;
	then<U>(callback:(value:T) => IPromise<U>, errback?:(reason:any) => IPromise<U>, progback?:(update:any) => U):IPromise<U>;
	then<U>(callback:(value:T) => IPromise<U>, errback?:(reason:any) => U,           progback?:(update:any) => U):IPromise<U>;
	then<U>(callback:(value:T) => U,           errback?:(reason:any) => IPromise<U>, progback?:(update:any) => U):IPromise<U>;
	then<U>(callback:(value:T) => U,           errback?:(reason:any) => U,           progback?:(update:any) => U):IPromise<U>;
}

interface IStore<T> {
	idProperty:string;
	get(id:any):T;
	put(object:T, options?:Object):any; // string | number
}

declare var define:{
	(dependencies:string[], callback?:Function):void;
};

declare var require:{
	(config:Object, dependencies:string[], callback?:Function):void;
	(dependencies:string[], callback?:Function):void;
	<T>(moduleId:string):T;
};

declare module 'dojo/_base/array' {
	var array:{
		every<T>(array:T[], callback:(value:T, index:number, array:T[]) => boolean, thisArg?:any):boolean;
		filter<T>(array:T[], callback:(value:T, index:number, array:T[]) => boolean, thisArg?:any):T[];
		forEach<T>(array:T[], callback:(value:T, index:number, array:T[]) => void, thisArg?:any): void;
		indexOf<T>(array:T[], value:T, fromIndex?:number, findLast?:boolean):number;
		lastIndexOf<T>(array:T[], value:T, fromIndex?:number):number;
		map<T>(array:T[], callback:(value:T, index:number, array:T[]) => T, thisArg?:any):T[];
		some<T>(array:T[], callback:(value:T, index:number, array:T[]) => boolean, thisArg?:any):boolean;
	};
	export = array;
}

declare module 'dojo/_base/declare' {
	var decl:{
		<T>(superclass:any, properties?:Object):new (...args:any[]) => T;
		<T>(superclass:any[], properties?:Object):new (...args:any[]) => T;
		safeMixin<T>(target:T, source:Object):T;
	};

	export = decl;
}

declare module 'dojo/_base/lang' {
	var lang:{
		delegate<T>(object:T, properties?:Object):T;
		getObject(key:string, create?:boolean, context?:Object):any;
		hitch(context:Object, property:string, ...prefixedArgs:Object[]):(...args:any[]) => any;
		hitch(context:Object, fn:Function, ...prefixedArgs:Object[]):(...args:any[]) => any;
		mixin<T>(target:T, ...source:Object[]):T;
		partial<T>(fn:T):T;
		partial(fn:Function, ...prefixedArgs:any[]):Function;
		replace(template:string, kwArgs:Object, pattern?:RegExp):string;
		setObject(key:string, value:any, context?:Object):any;
		trim(string:string):string;
		isArray(it:any):boolean;
	};
	export = lang;
}

declare module 'dojo/aspect' {
	var aspect:{
		after(target:Object, methodName:string, advice:(...args:any[]) => any, receiveArguments?:boolean):IHandle;
		around(target:Object, methodName:string, advice:(...args:any[]) => any):IHandle;
		before(target:Object, methodName:string, advice:(...args:any[]) => any):IHandle;
	};
	export = aspect;
}

declare module 'dojo/Deferred' {
	var Deferred:{
		new (canceler:(reason:any) => any):IDeferred<any>;
		when<T>(value:T):IPromise<T>;
		when<T>(value:IPromise<T>):IPromise<T>;
		when<T, U>(valueOrPromise:T, callback?:(value:T) => IPromise<U>):IPromise<U>;
		when<T, U>(valueOrPromise:T, callback?:(value:T) => U):IPromise<U>;
	};
	export = Deferred;
}

declare module 'dojo/dom-construct' {
	var domConstruct:{
		toDom(html:string):Node;
		place<T extends Element>(node:T, refNode:Node, position?:string):T;
		place<T extends Element>(node:T, refNode:Node, position?:number):T;
		create(tag:'div', attrs:Object, refNode?:Node, position?:string):HTMLDivElement;
		create(tag:'li', attrs:Object, refNode?:Node, position?:string):HTMLLIElement;
		create(tag:string, attrs:Object, refNode?:Node, position?:string):Element;
	};
	export = domConstruct;
}

declare module 'dojo/errors/create' {
	var create:{
		(name:string, ctor:Function, base:Function, props:{ [key:string]:any; }):any;
	};
	export = create;
}

declare module 'dojo/Evented' {
	class Evented implements IEvented {
		emit(type:string, event?:Event):boolean;
		on(type:(target:any, listener:(event:Event) => void) => void, listener:(event:Event) => void):IHandle;
		on(type:string, listener:(event:Event) => void):IHandle;
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

declare module 'dojo/hash' {
	var hash:{
		(value?:string, replace?:boolean):string;
	};
	export = hash;
}

declare module 'dojo/io-query' {
	var ioQuery:{
		objectToQuery(map:any):string;
		queryToObject(str:string):any;
	};
	export = ioQuery;
}

declare module 'dojo/promise/all' {
	var all:{
		<T>(array:T[]):IPromise<T[]>;
		(object:Object):IPromise<Object>;
	};
	export = all;
}

declare module 'dojo/request/util' {
	var util:{
		addCommonMethods(provider:any, methods:string[]):void;
		checkStatus(status:number):boolean;
		deepCopy<T>(target:T, source:Object):T;
		deepCreate<T>(source:T, properties:Object):T;
		deferred(response:Object /*IResponseObject*/, cancel:Function /*Canceller*/, isValid:boolean, isReady:boolean, handleResponse:any, last:Function):void;
		parseArgs(url:any, options:any, skipData:any):{ url:string; options:string; getHeader:(name:string) => string; };
	};
	export = util;
}

declare module 'dojo/Stateful' {
	class Stateful {
		constructor(kwArgs:Object);
		get(key:string):any;
		set(kwArgs:Object):void;
		set(key:string, value:any):void;
		watch(callback:Stateful.ICallback<any>):IHandle;
		watch(key:string, callback:Stateful.ICallback<any>):IHandle;
	}

	module Stateful {
		export interface ICallback<T> {
			(key:string, oldValue:T, newValue:T):void;
		}
	}

	export = Stateful;
}

declare module 'dojo/store/Memory' {
	class MemoryStore<T> implements IStore<T> {
		data:T[];
		idProperty:string;
		constructor(kwArgs:Object);
		get(id:any):T;
		put(object:T, options?:Object):any; // string | number
		setData(data:T[]):void;
	}

	export = MemoryStore;
}

declare module 'dojo/store/Observable' {
	class ObservableStore<T> implements IStore<T> {
		idProperty:string;
		constructor(kwArgs:Object);
		get(id:any):T;
		put(object:T, options?:Object):any; // string | number
		setData(data:T[]):void;
	}

	export = ObservableStore;
}

declare module 'dojo/text' {
	var text:{
		dynamic:boolean;
		normalize(id:string, toAbsMid:(url:string) => string):string;
		load(id:string, require:Function, load:(text:string) => void):void;
	};
	export = text;
}

declare module 'dojo/topic' {
	var topic:{
		publish(topic:string, event:Object):void;
		subscribe(topic:string, listener:() => void):{ remove: () => void };
	};
	export = topic;
}

declare module 'dojo/when' {
	var when:{
		<T>(value:T):IPromise<T>;
		<T>(value:IPromise<T>):IPromise<T>;
		<T, U>(valueOrPromise:T, callback?:(value:T) => IPromise<U>):IPromise<U>;
		<T, U>(valueOrPromise:T, callback?:(value:T) => U):IPromise<U>;
	};
	export = when;
}
