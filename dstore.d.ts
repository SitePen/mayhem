/// <reference path="./dojo.d.ts"/>

declare module dstore {
	export interface ICollection<T> extends IEvented {
		model:new (...args:any[]) => T;

		total?:any; /* number, IPromise<number> */
		sorted?:any;
		filtered?:any;
		ranged?:Object;

		create(properties:Object):T;
		getIdentity(object:T):any;
		_setIdentity(object:T, identity:any):any;
		get(id:any):any;
		put(object:T, options?:Object):any;
		add(object:T, options?:Object):any;
		remove(id:any):any;

		filter(query:string):ICollection<T>;
		filter(query:Object):ICollection<T>;
		filter(query:(item:T, index:number) => boolean):ICollection<T>;
		sort(property:string, descending?:boolean):ICollection<T>;
		sort(property:(a:T, b:T) => number, descending?:boolean):ICollection<T>;
		range(start:number, end?:number):ICollection<T>;
		forEach(callback:(item:T, index:number) => void, thisObject?:any):any; /* void, IPromise<void> */
		map<U>(callback:(item:T, index:number) => U, thisObject?:any):ICollection<U>;
		fetch():any; /* T[], IPromise<T[]> */
	}
	export interface ISyncCollection<T> extends ICollection<T> {
		total?:number;

		get(id:any):T;
		put(object:T, options?:Object):T;
		add(object:T, options?:Object):T;
		remove(id:any):boolean;

		filter(query:string):ISyncCollection<T>;
		filter(query:Object):ISyncCollection<T>;
		filter(query:(item:T, index:number) => boolean):ISyncCollection<T>;
		sort(property:string, descending?:boolean):ISyncCollection<T>;
		sort(property:(a:T, b:T) => number, descending?:boolean):ISyncCollection<T>;
		range(start:number, end?:number):ISyncCollection<T>;
		forEach(callback:(item:T, index:number) => void, thisObject?:any):void;
		map<U>(callback:(item:T, index:number) => U, thisObject?:any):ISyncCollection<U>;
		fetch():T[];
	}
	export interface IAsyncCollection<T> extends ICollection<T> {
		total?:IPromise<number>;

		get(id:any):IPromise<T>;
		put(object:T, options?:Object):IPromise<T>;
		add(object:T, options?:Object):IPromise<T>;
		remove(id:any):IPromise<Object>;

		filter(query:string):IAsyncCollection<T>;
		filter(query:Object):IAsyncCollection<T>;
		filter(query:(item:T, index:number) => boolean):IAsyncCollection<T>;
		sort(property:string, descending?:boolean):IAsyncCollection<T>;
		sort(property:(a:T, b:T) => number, descending?:boolean):IAsyncCollection<T>;
		range(start:number, end?:number):IAsyncCollection<T>;
		forEach(callback:(item:T, index:number) => void, thisObject?:any):IPromise<void>;
		map<U>(callback:(item:T, index:number) => U, thisObject?:any):IAsyncCollection<U>;
		fetch():IPromise<T[]>;
	}

	export interface IObserver<T> {
		(value:T, oldValue:T):void;
	}

	export interface IQueryEngine {
		filter(query:any):(data:any[]) => any[];
		sort(sorted:any):(data:any[]) => any[];
		range(range:any):(data:any[]) => any[];
	}

	export interface IModel {
		additionalProperties:boolean;
		scenario:string;

		init(options:any):void;
		save(options:any):any; /* any, IPromise<any> */
		remove():any; /* any, IPromise<any> */
		prepareForSerialization():void;
		validationError():Error;
		property(key:string):IProperty<any>;
		get(key:string):any;
		set(key:string, value:any):void;
		set(value:Object):void;
		observe(key:string, listener:IObserver<any>, options?:Object):IHandle;
		validate(fields?:string[]):IPromise<boolean>;
		isValid():boolean;
	}
	export interface IProperty<T> {
		init(options:any):void;
		observe(listener:Function, options?:Object):IHandle;
		valueOf():T;
		setValue(value:T):void;
		put(value:T):IPromise<any>;
		coerce(value:any):T;
		addError(error:Error):void;
		checkForErrors(value:T):Error[];
		validate():IPromise<boolean>;
	}
}

declare module 'dstore/Cache' {
	import Store = require('dstore/Store');

	class Cache<T> extends Store<T> {
		cachingStore:dstore.ICollection<T>;
		evict(id:any):void;
	}

	export = Cache;
}

declare module 'dstore/legacy/DstoreAdapter' {
	import Store = require('dstore/Store');

	class DstoreAdapter<T> extends Store<T> {
		static adapt<U>(store:dstore.ICollection<U>, config?:Object):DstoreAdapter<U>;
		query(query:any, options?:Object):any;
	}

	export = DstoreAdapter;
}

declare module 'dstore/Memory' {
	import Store = require('dstore/Store');

	class Memory<T> extends Store<T> implements dstore.ISyncCollection<T> {
		data:any[];
		get(id:any):T;
		put(object:T, options?:Object):T;
		add(object:any, options?:Object):T;
		remove(id:any):boolean;
		setData(data:any[]):void;
	}

	export = Memory;
}

declare module 'dstore/Model' {
	class Model implements dstore.IModel {
		additionalProperties:boolean;
		scenario:string;

		init(options:any):void;
		save(options:any):any; /* any, IPromise<any> */
		remove():any; /* any, IPromise<any> */
		prepareForSerialization():void;
		validationError():Error;
		property(key:string):dstore.IProperty<any>;
		get(key:string):any;
		set(key:string, value:any):void;
		set(value:Object):void;
		observe(key:string, listener:dstore.IObserver<any>, options?:Object):IHandle;
		validate(fields?:string[]):IPromise<boolean>;
		isValid():boolean;
	}
	module Model {
		export class Property<T> implements dstore.IProperty<T> {
			init(options:any):void;
			observe(listener:dstore.IObserver<T>, options?:Object):IHandle;
			valueOf():T;
			setValue(value:T):void;
			put(value:T):IPromise<any>;
			coerce(value:any):T;
			addError(error:Error):void;
			checkForErrors(value:T):Error[];
			validate():IPromise<boolean>;
		}
	}
	export = Model;
}

declare module 'dstore/objectQueryEngine' {
	var engine:dstore.IQueryEngine;

	export = engine;
}

declare module 'dstore/Observable' {
	class Observable<T> {
		currentRange:any[];

		track():dstore.ICollection<T>;
	}

	export = Observable;
}

declare module 'dstore/Request' {
	import Store = require('dstore/Store');
	import Model = require('dstore/Model');

	class Request<T> extends Store<T> {
		headers:Object;
		parse:(string:string) => Object;
		target:string;
		ascendingPrefix:string;
		descendingPrefix:string;
		accepts:string;
	}

	export = Request;
}

declare module 'dstore/RequestMemory' {
	import Request = require('dstore/Request');
	import Cache = require('dstore/Cache');

	class RequestMemory<T> extends Request<T> implements Cache<T> {
		cachingStore:dstore.ICollection<T>;
		evict(id:any):void;
	}

	export = RequestMemory;
}

declare module 'dstore/Rest' {
	import Request = require('dstore/Request');
	import Model = require('dstore/Model');

	class Rest<T> extends Request<T> implements dstore.IAsyncCollection<T> {
		stringify:(object:Object) => string;
		get(id:any, options?:Object):IPromise<T>;
		put(object:T, options?:Object):IPromise<T>;
		add(object:T, options?:Object):IPromise<T>;
		remove(id:any, options?:Object):IPromise<any>;
	}

	export = Rest;
}

declare module 'dstore/Store' {
	import Evented = require('dojo/Evented');

	class Store<T> extends Evented {
		model:new (...args:any[]) => T;
		constructor(options?:Object);
		getIdentity(object:T):any;
		_setIdentity(object:T, identity:any):any;
		_restore(object:Object):any;
		create(properties:Object):T;
		filter(filter:any):dstore.ICollection<T>;
		sort(property:any, descending?:boolean):dstore.ICollection<T>;
		range(start:number, end?:number):dstore.ICollection<T>;
		forEach(callback:(item:T, index:number, collection:dstore.ICollection<T>) => void, thisObject?:any):any; /* void, IPromise<void> */
		map<U>(callback:(item:T, index:number, collection:dstore.ICollection<T>) => U, thisObject?:any):dstore.ICollection<U>;
		fetch():any;
	}

	export = Store;
}
