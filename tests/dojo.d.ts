declare var define:{
	(dependencies:string[], callback?:Function):void;
};

// Node defines require and this conflicts
/*declare var require:{
	(config:{}, dependencies:string[], callback?:Function):void;
	(dependencies:string[], callback?:Function):void;
	<T>(moduleId:string):T;
	undef(moduleId:string):void;
	config(config:{}):void;
	toUrl(moduleId:string):string;
	toAbsMid(moduleId:string):string;
	on(eventName:string, listener:(...args:any[]) => any):IHandle;
};*/

interface HashMap<T> {
	[key:string]:T;
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
	(target:{}, callback:EventListener):IHandle;
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
	idProperty?:string;
	get?(id:any):any;
	put?(object:T, options?:{}):any;
	remove?(id:any):any;
	query?(query:any, options?:{}):any;
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
		<T>(superclass:any, properties?:{}):new (...args:any[]) => T;
		<T>(superclass:any[], properties?:{}):new (...args:any[]) => T;
		safeMixin<T>(target:T, source:{}):T;
	};

	export = decl;
}

declare module 'dojo/_base/lang' {
	var lang:{
		delegate<T>(object:T, properties?:{}):T;
		getObject(key:string, create?:boolean, context?:{}):any;
		hitch(context:{}, property:string, ...prefixedArgs:{}[]):(...args:any[]) => any;
		hitch(context:{}, fn:Function, ...prefixedArgs:{}[]):(...args:any[]) => any;
		mixin<T>(target:T, ...source:{}[]):T;
		partial<T>(fn:T):T;
		partial(fn:Function, ...prefixedArgs:any[]):Function;
		replace(template:string, kwArgs:{}, pattern?:RegExp):string;
		setObject(key:string, value:any, context?:{}):any;
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

declare module 'dojo/AdapterRegistry' {
	class AdapterRegistry<T> {
		constructor(returnWrappers?:boolean);
		register(
			name:string,
			check:(...args:any[]) => boolean,
			wrap:(...args:any[]) => T,
			directReturn?:boolean,
			override?:boolean
		):void;
		match(...args:any[]):T;
		unregister(name:string):boolean;
	}
	export = AdapterRegistry;
}

declare module 'dojo/aspect' {
	var aspect:{
		after(target:{}, methodName:string, advice:(...args:any[]) => any, receiveArguments?:boolean):IHandle;
		around(target:{}, methodName:string, advice:(...args:any[]) => any):IHandle;
		before(target:{}, methodName:string, advice:(...args:any[]) => any):IHandle;
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

declare module 'dojo/date/stamp' {
	module stamp {
		export interface IStampOptions {
			milliseconds?:boolean;
			selector?:string;
			zulu?:boolean;
		}

		export function fromISOString(date:string, defaultTime?:number):Date;
		export function toISOString(date:Date, options?:IStampOptions):string;
	}

	export = stamp;
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
		create(tag:'div', attrs:{}, refNode?:Node, position?:string):HTMLDivElement;
		create(tag:'li', attrs:{}, refNode?:Node, position?:string):HTMLLIElement;
		create(tag:'ol', attrs:{}, refNode?:Node, position?:string):HTMLOListElement;
		create(tag:'p', attrs:{}, refNode?:Node, position?:string):HTMLParagraphElement;
		create(tag:'ul', attrs:{}, refNode?:Node, position?:string):HTMLUListElement;
		create(tag:string, attrs:{}, refNode?:Node, position?:string):Element;
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
		parse(value:string):{};
		stringify(value:{}):string;
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

declare module 'dojo/promise/Promise' {
	var Promise:{
		new <T>():IPromise<T>;
	};
	export = Promise;
}

declare module 'dojo/promise/all' {
	var all:{
		<T>(array:IPromise<T>[]):IPromise<T[]>;
		<T>(array:T[]):IPromise<T[]>;
		(object:{}):IPromise<Object>;
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
		<T>(url:string, options?:{}):IPromise<T>;
		del<T>(url:string, options?:{}):IPromise<T>;
		get<T>(url:string, options?:{}):IPromise<T>;
		post<T>(url:string, options?:{}):IPromise<T>;
		put<T>(url:string, options?:{}):IPromise<T>;
	};
	export = request;
}

declare module 'dojo/request/util' {
	var util:{
		addCommonMethods(provider:any, methods:string[]):void;
		checkStatus(status:number):boolean;
		deepCopy<T>(target:T, source:{}):T;
		deepCreate<T>(source:T, properties:{}):T;
		deferred(response:{} /*IResponseObject*/, cancel:Function /*Canceller*/, isValid:boolean, isReady:boolean, handleResponse:any, last:Function):void;
		parseArgs(url:any, options:any, skipData:any):{ url:string; options:string; getHeader:(name:string) => string; };
	};
	export = util;
}

declare module 'dojo/Stateful' {
	class Stateful {
		constructor(kwArgs:{});
		get(key:string):any;
		set(kwArgs:{}):void;
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
		constructor(kwArgs:{});
		get(id:any):T;
		put(object:T, options?:{}):any; // string | number
		setData(data:T[]):void;
	}

	export = MemoryStore;
}

declare module 'dojo/store/Observable' {
	class ObservableStore<T> implements IStore<T> {
		idProperty:string;
		constructor(kwArgs:{});
		get(id:any):T;
		put(object:T, options?:{}):any; // string | number
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
		observe?(callback:(object:{}, removedFrom:number, insertedInto:number) => void, includeObjectUpdates?:boolean):IHandle;
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
		publish(topic:string, event:{}):void;
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
