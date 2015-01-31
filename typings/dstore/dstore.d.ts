/// <reference path="../dojo/dojo.d.ts" />

declare module dstore {
	export interface FetchArray<T> extends Array<T> {
		totalLength:number;
	}

	export interface FetchPromise<T> extends IPromise<T> {
		totalLength:IPromise<number>;
	}

	export interface ChangeEvent extends Event {
		id:string;
		index?:number;
		previousIndex?:number;
		target:any;
		totalLength:number;
		type:string;
	}

	export interface ICollection<T> extends IEvented {
		idProperty:string;
		Model:{ new (...args:any[]):T; };
		tracking?:{ remove():void; };

		add(object:T, options?:{}):IPromise<T>;
		fetch():dstore.FetchPromise<T[]>;
		fetchRange(kwArgs:{ start?:number; end?:number; }):dstore.FetchPromise<T[]>;
		filter(query:string):ICollection<T>;
		filter(query:{}):ICollection<T>;
		filter(query:(item:T, index:number) => boolean):ICollection<T>;
		forEach(callback:(item:T, index:number) => void, thisObject?:any):IPromise<T[]>;
		get(id:any):IPromise<T>;
		getIdentity(object:T):any;
		put(object:T, options?:{}):IPromise<T>;
		remove(id:any):IPromise<Object>;
		sort(property:string, descending?:boolean):ICollection<T>;
		sort(property:(a:T, b:T) => number, descending?:boolean):ICollection<T>;
		track?():ICollection<T>;
	}

	export interface ISyncCollection<T> extends ICollection<T> {
		addSync(object:T, options?:{}):T;
		fetchSync():dstore.FetchArray<T>;
		fetchRangeSync(kwArgs:{ start?:number; end?:number; }):dstore.FetchArray<T>;
		filter(query:string):ISyncCollection<T>;
		filter(query:{}):ISyncCollection<T>;
		filter(query:(item:T, index:number) => boolean):ISyncCollection<T>;
		getSync(id:any):T;
		putSync(object:T, options?:{}):T;
		removeSync(id:any):boolean;
		sort(property:string, descending?:boolean):ISyncCollection<T>;
		sort(property:(a:T, b:T) => number, descending?:boolean):ISyncCollection<T>;
		track?():ISyncCollection<T>;
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
	class DstoreAdapter<T> {
		constructor(collection:dstore.ICollection<T>);
		get(id:any):any;
		put(object:T, options?:{}):any;
		remove(id:any):any;
		query(query:any, options?:{}):any;
	}

	export = DstoreAdapter;
}

declare module 'dstore/Memory' {
	import Store = require('dstore/Store');

	class Memory<T> extends Store<T> implements dstore.ISyncCollection<T> {
		data:T[];

		addSync(object:T, options?:{}):T;
		fetchSync():dstore.FetchArray<T>;
		fetchRangeSync(kwArgs:{ start?:number; end?:number; }):dstore.FetchArray<T>;
		filter(query:string):Memory<T>;
		filter(query:{}):Memory<T>;
		filter(query:(item:T, index:number) => boolean):Memory<T>;
		getSync(id:any):T;
		putSync(object:T, options?:{}):T;
		removeSync(id:any):boolean;
		setData(data:T[]):void;
		sort(property:string, descending?:boolean):Memory<T>;
		sort(property:(a:T, b:T) => number, descending?:boolean):Memory<T>;
		track():Memory<T>;
	}

	export = Memory;
}

declare module 'dstore/Trackable' {
	class Trackable<T> {
		currentRange:any[];
		track():dstore.ICollection<T>;
	}

	export = Trackable;
}

declare module 'dstore/Request' {
	import Store = require('dstore/Store');

	class Request<T> extends Store<T> {
		headers:{};
		parse:(serializedObject:string) => {};
		target:string;
		ascendingPrefix:string;
		descendingPrefix:string;
		accepts:string;

		filter(query:string):Request<T>;
		filter(query:{}):Request<T>;
		filter(query:(item:T, index:number) => boolean):Request<T>;
		sort(property:string, descending?:boolean):Request<T>;
		sort(property:(a:T, b:T) => number, descending?:boolean):Request<T>;
		track():Request<T>;
	}

	export = Request;
}

declare module 'dstore/RequestMemory' {
	import Request = require('dstore/Request');
	import Cache = require('dstore/Cache');

	class RequestMemory<T> extends Request<T> implements Cache<T> {
		cachingStore:dstore.ICollection<T>;
		evict(id:any):void;

		filter(query:string):RequestMemory<T>;
		filter(query:{}):RequestMemory<T>;
		filter(query:(item:T, index:number) => boolean):RequestMemory<T>;
		sort(property:string, descending?:boolean):RequestMemory<T>;
		sort(property:(a:T, b:T) => number, descending?:boolean):RequestMemory<T>;
		track():RequestMemory<T>;
	}

	export = RequestMemory;
}

declare module 'dstore/Rest' {
	import Request = require('dstore/Request');

	class Rest<T> extends Request<T> {
		filter(query:string):Rest<T>;
		filter(query:{}):Rest<T>;
		filter(query:(item:T, index:number) => boolean):Rest<T>;
		sort(property:string, descending?:boolean):Rest<T>;
		sort(property:(a:T, b:T) => number, descending?:boolean):Rest<T>;
		track():Rest<T>;
	}

	export = Rest;
}

declare module 'dstore/Store' {
	import Evented = require('dojo/Evented');

	class Store<T> extends Evented implements dstore.ICollection<T> {
		idProperty:string;
		Model:{ new (...args:any[]):T; };
		total:IPromise<number>;

		add(object:T, options?:{}):IPromise<T>;
		fetch():dstore.FetchPromise<T[]>;
		fetchRange(kwArgs:{ start?:number; end?:number; }):dstore.FetchPromise<T[]>;
		filter(query:string):Store<T>;
		filter(query:{}):Store<T>;
		filter(query:(item:T, index:number) => boolean):Store<T>;
		forEach(callback:(item:T, index:number) => void, thisObject?:any):IPromise<T[]>;
		get(id:any):IPromise<T>;
		getIdentity(object:T):any;
		put(object:T, options?:{}):IPromise<T>;
		remove(id:any):IPromise<{}>;
		sort(property:string, descending?:boolean):Store<T>;
		sort(property:(a:T, b:T) => number, descending?:boolean):Store<T>;
	}

	export = Store;
}
