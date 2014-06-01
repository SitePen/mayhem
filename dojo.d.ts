declare var define:{
	(dependencies:string[], callback?:Function):void;
};

declare var require:{
	(config:Object, dependencies:string[], callback?:Function):void;
	(dependencies:string[], callback?:Function):void;
	<T>(moduleId:string):T;
	undef(moduleId:string):void;
	config(config:Object):void;
	toUrl(moduleId:string):string;
	toAbsMid(moduleId:string):string;
};

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

interface IPausableHandle extends IHandle {
	pause:() => void;
	resume:() => void;
}

interface IPromise<T> {
	always<U>(callback:(valueOrError:any) => U):IPromise<U>;
	cancel<U>(reason?:U, strict?:boolean):U;
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

declare module 'dojo/_base/array' {
	var array:{
		every<T>(array:T[], callback:(value:T, index:number, array:T[]) => boolean, thisArg?:any):boolean;
		filter<T>(array:T[], callback:(value:T, index:number, array:T[]) => boolean, thisArg?:any):T[];
		forEach<T>(array:T[], callback:(value:T, index:number, array:T[]) => void, thisArg?:any): void;
		indexOf<T>(array:T[], value:T, fromIndex?:number, findLast?:boolean):number;
		lastIndexOf<T>(array:T[], value:T, fromIndex?:number):number;
		map<T, U>(array:T[], callback:(value:T, index:number, array:T[]) => U, thisArg?:any):U[];
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
		clone(object:any):any;
	};
	export = lang;
}

declare module 'dojo/_base/window' {
	var window:{
		body(document?:HTMLDocument):HTMLBodyElement;
	};
	export = window;
}

declare module 'dojo/aspect' {
	var aspect:{
		after(target:Object, methodName:string, advice:(...args:any[]) => any, receiveArguments?:boolean):IHandle;
		around(target:Object, methodName:string, advice:(...args:any[]) => any):IHandle;
		before(target:Object, methodName:string, advice:(...args:any[]) => any):IHandle;
	};
	export = aspect;
}

declare module 'dojo/date/locale' {
	module locale {
		export interface IFormatOptions {
			selector?:string;
			formatLength?:string;
			datePattern?:string;
			timePattern?:string;
			am?:string;
			pm?:string;
			locale?:string;
			fullYear?:boolean;
			strict?:boolean;
		}

		export function format(date:Date, options?:locale.IFormatOptions):string;
		export function parse(date:string, options?:locale.IFormatOptions):Date;
	}

	export = locale;
}

declare module 'dojo/Deferred' {
	var Deferred:{
		new <T>(canceler?:(reason:any) => any):IDeferred<T>;
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
		destroy(node:Node):void;
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
		add(feature:string, value:any, now?:boolean, force?:boolean):void;
	};
	export = has;
}

declare module 'dojo/hash' {
	var hash:{
		(value?:string, replace?:boolean):string;
	};
	export = hash;
}

declare module 'dojo/json' {
	var json:{
		parse(value:string):Object;
		stringify(value:Object):string;
	};
	export = json;
}

declare module 'dojo/keys' {
	var keyCodeMap:any;

	export = keyCodeMap;
}

declare module 'dojo/io-query' {
	var ioQuery:{
		objectToQuery(map:any):string;
		queryToObject(str:string):any;
	};
	export = ioQuery;
}

declare module 'dojo/mouse' {
	var mouse:{
		enter:IExtensionEvent;
		leave:IExtensionEvent;
		wheel:IExtensionEvent;
	};
	export = mouse;
}

declare module 'dojo/NodeList' {
	class NodeList {
		length:number;
		[n:number]:Element;
		at(...indexes:number[]):NodeList;
		concat(...items:Element[]):NodeList;
		every(callbackfn:(value:Element, index:number, array:NodeList) => boolean, thisArg?:any):boolean;
		filter(callbackfn:(value:Element, index:number, array:NodeList) => boolean, thisArg?:any):NodeList;
		forEach(callbackfn:(value:Element, index:number, array:NodeList) => void, thisArg?:any):void;
		indexOf(searchElement:Element, fromIndex?:number):number;
		join(separator?:string):string;
		lastIndexOf(searchElement:Element, fromIndex?:number):number;
		map<T>(callbackfn:(value:Element, index:number, array:NodeList) => T, thisArg?:any):NodeList;
		pop():Element;
		push(...items:Element[]):number;
		reverse():NodeList;
		shift():Element;
		slice(start?:number, end?:number):NodeList;
		some(callbackfn:(value:Element, index:number, array:NodeList) => boolean, thisArg?:any):boolean;
		sort(compareFn?:(a:Element, b:Element) => number):NodeList;
		splice(start:number):NodeList;
		splice(start:number, deleteCount:number, ...items:Element[]):NodeList;
		unshift(...items:Element[]):number;
	}
	export = NodeList;
}

declare module 'dojo/on' {
	var on:{
		(target:Node, type:string, listener:EventListener, dontFix?:boolean):IHandle;

		parse(target:any, type:string, listener:EventListener, addListener:Function, dontFix?:boolean, matchesTarget?:any):IHandle;
		parse(target:any, type:IExtensionEvent, listener:EventListener, addListener:Function, dontFix?:boolean, matchesTarget?:any):IHandle;
		pausable(target:Node, type:string, listener:EventListener, dontFix?:boolean):IPausableHandle;
	};
	export = on;
}

declare module 'dojo/promise/all' {
	var all:{
		<T>(array:IPromise<T>[]):IPromise<T[]>;
		<T>(array:T[]):IPromise<T[]>;
		(object:Object):IPromise<Object>;
	};
	export = all;
}

declare module 'dojo/query' {
	import NodeList = require('dojo/NodeList');
	var query:{
		(selector:string, root?:Element):NodeList;
	};
	export = query;
}

declare module 'dojo/request' {
	var request:{
		<T>(url:string, options?:Object):IPromise<T>;
		del<T>(url:string, options?:Object):IPromise<T>;
		get<T>(url:string, options?:Object):IPromise<T>;
		post<T>(url:string, options?:Object):IPromise<T>;
		put<T>(url:string, options?:Object):IPromise<T>;
	};
	export = request;
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

declare module 'dojo/string' {
	var string:{
		pad(text:any, size:number, char?:string, end?:boolean):string;
	};
	export = string;
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

declare module 'dojo/store/util/QueryResults' {
	var QueryResults:{
		new <T>(results:any):QueryResults<T>;
		<T>(results:any):QueryResults<T>;
	};
	interface QueryResults<T> {
		total:any;
		forEach(callback:(value:T, index:number, array:T[]) => void, thisArg?:any):any;
		filter(callback:(value:T, index:number, array:T[]) => boolean, thisArg?:any):QueryResults<T>;
		map<U>(callback:(value:T, index:number, array:T[]) => U, thisArg?:any):QueryResults<T>;
		always?<U>(callback:(valueOrError:any) => U):IPromise<U>;
		cancel?<U>(reason?:U, strict?:boolean):U;
		isCanceled?():boolean;
		isFulfilled?():boolean;
		isRejected?():boolean;
		isResolved?():boolean;
		otherwise?<U>(errback:(reason:any) => IPromise<U>):IPromise<U>;
		otherwise?<U>(errback:(reason:any) => U):IPromise<U>;
		then?<U>(callback:(value:T) => IPromise<U>, errback?:(reason:any) => IPromise<U>, progback?:(update:any) => IPromise<U>):IPromise<U>;
		then?<U>(callback:(value:T) => IPromise<U>, errback?:(reason:any) => U,           progback?:(update:any) => IPromise<U>):IPromise<U>;
		then?<U>(callback:(value:T) => U,           errback?:(reason:any) => IPromise<U>, progback?:(update:any) => IPromise<U>):IPromise<U>;
		then?<U>(callback:(value:T) => U,           errback?:(reason:any) => U,           progback?:(update:any) => IPromise<U>):IPromise<U>;
		then?<U>(callback:(value:T) => IPromise<U>, errback?:(reason:any) => IPromise<U>, progback?:(update:any) => U):IPromise<U>;
		then?<U>(callback:(value:T) => IPromise<U>, errback?:(reason:any) => U,           progback?:(update:any) => U):IPromise<U>;
		then?<U>(callback:(value:T) => U,           errback?:(reason:any) => IPromise<U>, progback?:(update:any) => U):IPromise<U>;
		then?<U>(callback:(value:T) => U,           errback?:(reason:any) => U,           progback?:(update:any) => U):IPromise<U>;
	}

	export = QueryResults;
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
		subscribe(topic:string, listener:(...args:any[]) => void):IHandle;
	};
	export = topic;
}

declare module 'dojo/touch' {
	var touch:{
		cancel:IExtensionEvent;
		enter:IExtensionEvent;
		leave:IExtensionEvent;
		move:IExtensionEvent;
		press:IExtensionEvent;
		release:IExtensionEvent;
		out:IExtensionEvent;
		over:IExtensionEvent;
	};
	export = touch;
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
