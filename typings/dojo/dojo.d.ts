declare var define: {
	(dependencies: string[], factory?: (...args: any[]) => any): void;
};

declare var require: {
	(config: {}, dependencies: string[], callback?: (...args: any[]) => void): void;
	(dependencies: string[], callback?: (...args: any[]) => void): void;
	<T>(moduleId: string): T;
	undef(moduleId: string): void;
	config(config: {}): void;
	toUrl(moduleId: string): string;
	toAbsMid(moduleId: string): string;
	on(eventName: string, listener: (...args: any[]) => any): IHandle;
};

interface HashMap<T> {
	[key: string]: T;
}

interface IDeferred<T, E> extends IPromise<T, E> {
	progress<U>(update: U, strict?: boolean): IPromise<T, E>;
	promise: IPromise<T, E>;
	reject(reason: E, strict?: boolean): IPromise<T, E>;
	resolve(value: T, strict?: boolean): IPromise<T, E>;
}

interface IEvented {
	emit(type: string, event?: Event): boolean;
	on(type: IExtensionEvent, listener: (event: {}) => void): IHandle;
	on(type: string, listener: (event: {}) => void): IHandle;
}

interface IExtensionEvent {
	(target: {}, callback: EventListener): IHandle;
}

interface IHandle {
	remove: () => void;
}

interface ILoaderPlugin {
	load(resourceId: string, contextRequire: typeof require, load: (...modules: any[]) => void): void;
	normalize?(resourceId: string, normalize: (id: string) => string): string;
}

interface IPausableHandle extends IHandle {
	pause: () => void;
	resume: () => void;
}

interface IPromise<T, E> {
	always<U, F>(callback?: (valueOrError: T | E) => IPromise<U, F> | U | void): IPromise<U, E | F>;
	cancel<U>(reason?: U, strict?: boolean): U;
	isCanceled(): boolean;
	isFulfilled(): boolean;
	isRejected(): boolean;
	isResolved(): boolean;
	otherwise<U, F>(errback?: (reason: E) => IPromise<U, F> | U | void): IPromise<U, E | F>;
	then<U, F>(callback?: (value: T) => IPromise<U, F> | U | void, errback?: (reason: E) => IPromise<U, F> | U | void, progback?: (update: any) => IPromise<U, F> | U | void): IPromise<U, E | F>;
}

interface IStore<T> {
	idProperty?: string;
	get?(id: any): any;
	put?(object: T, options?: {}): any;
	remove?(id: any): any;
	query?(query: any, options?: {}): any;
}

interface IRequestError extends Error {
		response: any;
}

declare module 'dojo/_base/array' {
	export function every<T>(array: T[], callback: (value: T, index: number, array: T[]) => boolean, thisArg?: any): boolean;
	export function filter<T>(array: T[], callback: (value: T, index: number, array: T[]) => boolean, thisArg?: any): T[];
	export function forEach<T>(array: T[], callback: (value: T, index: number, array: T[]) => void, thisArg?: any): void;
	export function indexOf<T>(array: T[], value: T, fromIndex?: number, findLast?: boolean): number;
	export function lastIndexOf<T>(array: T[], value: T, fromIndex?: number): number;
	export function map<T, U>(array: T[], callback: (value: T, index: number, array: T[]) => U, thisArg?: any): U[];
	export function some<T>(array: T[], callback: (value: T, index: number, array: T[]) => boolean, thisArg?: any): boolean;
}

declare module 'dojo/_base/declare' {
	function decl<T>(superclass: Function | Function[], properties?: {}): { new (...args: any[]): T; prototype: T; };

	module decl {
		export function safeMixin<T>(target: T, source: {}): T;
		export class Base {
			static createSubclass<T>(mixins: Function | Function[], properties?: {}): T;
			static createSubclass<T>(properties: {}): T;
		}
	}

	export = decl;
}

declare module 'dojo/_base/lang' {
	export function clone(object: any): any;
	export function delegate<T>(object: T, properties?: {}): T;
	export function getObject(key: string, create?: boolean, context?: {}): any;
	export function hitch(context: {}, property: string, ...prefixedArgs: {}[]): (...args: any[]) => any;
	export function hitch(context: {}, fn: Function, ...prefixedArgs: {}[]): (...args: any[]) => any;
	export function isArray(it: any): boolean;
	export function mixin<T>(target: T, ...source: {}[]): T;
	export function partial<T>(fn: T): T;
	export function partial(fn: Function, ...prefixedArgs: any[]): Function;
	export function replace(template: string, kwArgs: {}, pattern?: RegExp): string;
	export function setObject(key: string, value: any, context?: {}): any;
	export function trim(string: string): string;
}

declare module 'dojo/_base/window' {
	export function body(document?: HTMLDocument): HTMLBodyElement;
}

declare module 'dojo/AdapterRegistry' {
	class AdapterRegistry<T> {
		constructor(returnWrappers?: boolean);
		register(
			name: string,
			check: (...args: any[]) => boolean,
			wrap: (...args: any[]) => T,
			directReturn?: boolean,
			override?: boolean
		): void;
		match(...args: any[]): T;
		unregister(name: string): boolean;
	}
	export = AdapterRegistry;
}

declare module 'dojo/aspect' {
	export function after(target: {}, methodName: string, advice: (...args: any[]) => any, receiveArguments?: boolean): IHandle;
	export function around(target: {}, methodName: string, advice: (...args: any[]) => any): IHandle;
	export function before(target: {}, methodName: string, advice: (...args: any[]) => any): IHandle;
}

declare module 'dojo/currency' {
	import numberUtil = require('dojo/number');

	module currency {
		export function format(number: number, options?: currency.IFormatOptions): string;
		export function parse(number: string, options?: currency.IParseOptions): number;
		export function regexp(options: numberUtil.IRegExpOptions): RegExp;

		export interface IFormatOptions extends numberUtil.IFormatOptions {
			symbol?: string;
			currency?: string;
			places?: number;
		}

		export interface IParseOptions extends numberUtil.IParseOptions {
			currency?: string;
			symbol?: string;
			places?: number;
		}
	}

	export = currency;
}

declare module 'dojo/date/locale' {
	module locale {
		export interface IFormatOptions {
			selector?: string;
			formatLength?: string;
			datePattern?: string;
			timePattern?: string;
			am?: string;
			pm?: string;
			locale?: string;
			fullYear?: boolean;
			strict?: boolean;
		}

		export function format(date: Date, options?: locale.IFormatOptions): string;
		export function parse(date: string, options?: locale.IFormatOptions): Date;
	}

	export = locale;
}

declare module 'dojo/date/stamp' {
	module stamp {
		export interface IStampOptions {
			milliseconds?: boolean;
			selector?: string;
			zulu?: boolean;
		}

		export function fromISOString(date: string, defaultTime?: number): Date;
		export function toISOString(date: Date, options?: IStampOptions): string;
	}

	export = stamp;
}

declare module 'dojo/Deferred' {
	var Deferred: {
		new <T, E>(canceler?: (reason: any) => any): IDeferred<T, E>;
		prototype: IDeferred<any, any>;
		when<T, E>(value: IPromise<T, E> | T): IPromise<T, E>;
		when<T, U, F>(valueOrPromise: T, callback?: (value: T) => IPromise<U, F> | U): IPromise<U, F>;
	};
	interface Deferred<T, E> extends IDeferred<T, E> {}
	export = Deferred;
}

declare module 'dojo/dom-class' {
	export function contains(node: Element, classStr: string): boolean;
	export function add(node: Element, classStr: string): void;
	export function remove(node: Element, classStr: string): void;
	export function replace(node: Element, addClassStr: string, removeClassStr?: string): void;
	export function toggle(node: Element, classStr: string, condition?: boolean): void;
}

declare module 'dojo/dom-construct' {
	export function toDom(html: string): Node;
	export function place<T extends Element>(node: T, refNode: Node, position?: string): T;
	export function place<T extends Element>(node: T, refNode: Node, position?: number): T;
	export function create(tag: 'div', attrs: {}, refNode?: Node, position?: string): HTMLDivElement;
	export function create(tag: 'li', attrs: {}, refNode?: Node, position?: string): HTMLLIElement;
	export function create(tag: 'ol', attrs: {}, refNode?: Node, position?: string): HTMLOListElement;
	export function create(tag: 'p', attrs: {}, refNode?: Node, position?: string): HTMLParagraphElement;
	export function create(tag: 'ul', attrs: {}, refNode?: Node, position?: string): HTMLUListElement;
	export function create(tag: 'span', attrs: {}, refNode?: Node, position?: string): HTMLSpanElement;
	export function create(tag: string, attrs: {}, refNode?: Node, position?: string): Element;
	export function destroy(node: Node): void;
	export function empty(node: Element): void;
}

declare module 'dojo/errors/create' {
	var create: {
		(name: string, ctor: Function, base: Function, props: { [key: string]: any; }): any;
	};
	export = create;
}

declare module 'dojo/errors/RequestError' {
	var RequestError: {
		new (message: string, response?: any): IRequestError;
		prototype: IRequestError;
	};
	export = RequestError;
}

declare module 'dojo/Evented' {
	import decl = require('dojo/_base/declare');
	class Evented extends decl.Base implements IEvented {
		emit(type: string, event?: Event): boolean;
		on(type: (target: any, listener: (event: {}) => void) => void, listener: (event: {}) => void): IHandle;
		on(type: string, listener: (event: {}) => void): IHandle;
	}

	export = Evented;
}

declare module 'dojo/has' {
	var has: {
		(feature: string): any;
		add(feature: string, value: any, now?: boolean, force?: boolean): void;
	};
	export = has;
}

declare module 'dojo/hash' {
	function hash(value?: string, replace?: boolean): string;
	export = hash;
}

declare module 'dojo/json' {
	var json: {
		parse(value: string): {};
		stringify(value: {}): string;
	};
	export = json;
}

declare module 'dojo/keys' {
	var keyCodeMap: any;

	export = keyCodeMap;
}

declare module 'dojo/io-query' {
	export function objectToQuery(map: any): string;
	export function queryToObject(str: string): any;
}

declare module 'dojo/mouse' {
	export var enter: IExtensionEvent;
	export var leave: IExtensionEvent;
	export var wheel: IExtensionEvent;
}

declare module 'dojo/NodeList' {
	class NodeList {
		length: number;
		[n: number]: Element;
		at(...indexes: number[]): NodeList;
		concat(...items: Element[]): NodeList;
		every(callbackfn: (value: Element, index: number, array: NodeList) => boolean, thisArg?: any): boolean;
		filter(callbackfn: (value: Element, index: number, array: NodeList) => boolean, thisArg?: any): NodeList;
		forEach(callbackfn: (value: Element, index: number, array: NodeList) => void, thisArg?: any): void;
		indexOf(searchElement: Element, fromIndex?: number): number;
		join(separator?: string): string;
		lastIndexOf(searchElement: Element, fromIndex?: number): number;
		map<T>(callbackfn: (value: Element, index: number, array: NodeList) => T, thisArg?: any): NodeList;
		pop(): Element;
		push(...items: Element[]): number;
		reverse(): NodeList;
		shift(): Element;
		slice(start?: number, end?: number): NodeList;
		some(callbackfn: (value: Element, index: number, array: NodeList) => boolean, thisArg?: any): boolean;
		sort(compareFn?: (a: Element, b: Element) => number): NodeList;
		splice(start: number): NodeList;
		splice(start: number, deleteCount: number, ...items: Element[]): NodeList;
		unshift(...items: Element[]): number;
	}
	export = NodeList;
}

declare module 'dojo/number' {
	module numberUtil {
		export function format(number: number, options?: IFormatOptions): string;
		export function parse(number: string, options?: IParseOptions): number;
		export function regexp(options?: IRegExpOptions): RegExp;
		export function round(value: number, places?: number, increment?: number): number;

		export interface IFormatOptions {
			fractional?: boolean;
			locale?: string;
			pattern?: string;
			places?: number;
			type?: string;
			round?: number;
		}

		export interface IParseOptions {
			pattern?: string;
			type?: string;
			locale?: string;
			strict?: boolean;
			fractional?: boolean|boolean[];
		}

		export interface IRegExpOptions {
			pattern?: string;
			type?: string;
			locale?: string;
			strict?: boolean;
			places?: number|string;
		}
	}

	export = numberUtil;
}

declare module 'dojo/on' {
	function on(target: Node, type: string | IExtensionEvent, listener: EventListener, dontFix?: boolean): IHandle;
	module on {
		export function parse(target: any, type: string | IExtensionEvent, listener: EventListener, addListener: Function, dontFix?: boolean, matchesTarget?: any): IHandle;
		export function pausable(target: Node, type: string, listener: EventListener, dontFix?: boolean): IPausableHandle;
	}
	export = on;
}

declare module 'dojo/promise/Promise' {
	var Promise: {
		new <T, E>(): IPromise<T, E>;
		prototype: IPromise<any, any>;
	};
	interface Promise<T, E> extends IPromise<T, E> {}
	export = Promise;
}

declare module 'dojo/promise/all' {
	function all<T, E>(array: Array<IPromise<T, E> | T>): IPromise<T[], E>;
	function all(object: {}): IPromise<{}, any>;
	export = all;
}

declare module 'dojo/query' {
	import NodeList = require('dojo/NodeList');
	function query(selector: string, root?: Element): NodeList;
	export = query;
}

declare module 'dojo/request' {
	function request<T>(url: string, options?: {}): IPromise<T, IRequestError>;
	module request {
		function del<T>(url: string, options?: {}): IPromise<T, IRequestError>;
		function get<T>(url: string, options?: {}): IPromise<T, IRequestError>;
		function post<T>(url: string, options?: {}): IPromise<T, IRequestError>;
		function put<T>(url: string, options?: {}): IPromise<T, IRequestError>;
	}
	export = request;
}

declare module 'dojo/request/registry' {
	var registry: {
		<T, E>(url: string, options?: {}): IPromise<T, E>;
		del<T, E>(url: string, options?: {}): IPromise<T, E>;
		get<T, E>(url: string, options?: {}): IPromise<T, E>;
		post<T, E>(url: string, options?: {}): IPromise<T, E>;
		put<T, E>(url: string, options?: {}): IPromise<T, E>;
		register<T, E>(
			url: string|RegExp|{ (url: string, options?: {}): boolean; },
			provider: (url: String, options?: {}) => IPromise<T, E>,
			first?: boolean
		): IHandle;
	};
	export = registry;
}

declare module 'dojo/request/util' {
	export function addCommonMethods(provider: any, methods: string[]): void;
	export function checkStatus(status: number): boolean;
	export function deepCopy<T>(target: T, source: {}): T;
	export function deepCreate<T>(source: T, properties: {}): T;
	export function deferred(response: {} /*IResponseObject*/, cancel: Function /*Canceller*/, isValid: boolean, isReady: boolean, handleResponse: any, last: Function): void;
	export function parseArgs(url: any, options: any, skipData: any): { url: string; options: string; getHeader: (name: string) => string; };
}

declare module 'dojo/Stateful' {
	class Stateful {
		constructor(kwArgs: {});
		get(key: string): any;
		set(kwArgs: {}): void;
		set(key: string, value: any): void;
		watch(callback: Stateful.ICallback<any>): IHandle;
		watch(key: string, callback: Stateful.ICallback<any>): IHandle;
	}

	module Stateful {
		export interface ICallback<T> {
			(key: string, oldValue: T, newValue: T): void;
		}
	}

	export = Stateful;
}

declare module 'dojo/string' {
	var string: {
		pad(text: any, size: number, char?: string, end?: boolean): string;
	};
	export = string;
}

declare module 'dojo/store/Memory' {
	class MemoryStore<T> implements IStore<T> {
		data: T[];
		idProperty: string;
		constructor(kwArgs: {});
		get(id: any): T;
		put(object: T, options?: {}): any; // string | number
		setData(data: T[]): void;
	}

	export = MemoryStore;
}

declare module 'dojo/store/Observable' {
	class ObservableStore<T> implements IStore<T> {
		idProperty: string;
		constructor(kwArgs: {});
		get(id: any): T;
		put(object: T, options?: {}): any; // string | number
		setData(data: T[]): void;
	}

	export = ObservableStore;
}

declare module 'dojo/store/util/QueryResults' {
	var QueryResults: {
		new <T>(results: any): QueryResults<T>;
		<T>(results: any): QueryResults<T>;
		prototype: QueryResults<any>;
	};
	interface QueryResults<T> {
		total: any;
		forEach(callback: (value: T, index: number, array: T[]) => void, thisArg?: any): any;
		filter(callback: (value: T, index: number, array: T[]) => boolean, thisArg?: any): QueryResults<T>;
		map<U>(callback: (value: T, index: number, array: T[]) => U, thisArg?: any): QueryResults<T>;
		observe?(callback: (object: {}, removedFrom: number, insertedInto: number) => void, includeObjectUpdates?: boolean): IHandle;
		always?<U, E>(callback: (valueOrError: any) => U): IPromise<U, E>;
		cancel?<U>(reason?: U, strict?: boolean): U;
		isCanceled?(): boolean;
		isFulfilled?(): boolean;
		isRejected?(): boolean;
		isResolved?(): boolean;
		otherwise?<U, E>(errback: (reason: any) => IPromise<U, E> | U): IPromise<U, E>;
		then?<U, E>(callback: (value: T) => IPromise<U, E> | U, errback?: (reason: any) => IPromise<U, E> | U, progback?: (update: any) => IPromise<U, E> | U): IPromise<U, E>;
	}

	export = QueryResults;
}

declare module 'dojo/text' {
	export var dynamic: boolean;
	export function normalize(id: string, toAbsMid: (url: string) => string): string;
	export function load(id: string, require: Function, load: (text: string) => void): void;
}

declare module 'dojo/topic' {
	export function publish(topic: string, event: {}): void;
	export function subscribe(topic: string, listener: (...args: any[]) => void): IHandle;
}

declare module 'dojo/touch' {
	export var cancel: IExtensionEvent;
	export var enter: IExtensionEvent;
	export var leave: IExtensionEvent;
	export var move: IExtensionEvent;
	export var press: IExtensionEvent;
	export var release: IExtensionEvent;
	export var out: IExtensionEvent;
	export var over: IExtensionEvent;
}

declare module 'dojo/when' {
	var when: {
		<T, E>(value: IPromise<T, E> | T): IPromise<T, E>;
		<T, U, E>(valueOrPromise: T, callback?: (value: T) => IPromise<U, E> | U): IPromise<U, E>;
	};
	export = when;
}

declare module 'module' {
	export var id: string;
}
