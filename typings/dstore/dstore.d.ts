/// <reference path="../dojo/dojo.d.ts" />

declare module dstore {
	export interface FetchArray<T> extends Array<T> {
		totalLength: number;
	}

	export interface FetchPromise<T> extends IPromise<T> {
		totalLength: IPromise<number>;
	}

	export interface ChangeEvent<T> {
		id: any;
		index?: number;
		previousIndex?: number;
		target: T;
		totalLength: number;
		type: string;
	}

	export interface ICollection<T> {
		idProperty: string;
		Model: { new (...args: any[]): T; };
		tracking?: { remove(): void; };

		add(object: T, options?: {}): IPromise<T>;
		emit(eventName: string, event: ChangeEvent<T>): boolean;
		fetch(): dstore.FetchPromise<T[]>;
		fetchRange(kwArgs: { start?: number; end?: number; }): dstore.FetchPromise<T[]>;
		filter(query: string | {} | { (item: T, index: number): boolean; }): ICollection<T>;
		forEach(callback: (item: T, index: number) => void, thisObject?: any): IPromise<T[]>;
		get(id: any): IPromise<T>;
		getIdentity(object: T): any;
		on(eventName: string, listener: (event: ChangeEvent<T>) => void): IHandle;
		put(object: T, options?: {}): IPromise<T>;
		remove(id: any): IPromise<Object>;
		sort(property: string | { (a: T, b: T): number; }, descending?: boolean): ICollection<T>;
		track?(): ICollection<T>;
	}

	export interface ISyncCollection<T> extends ICollection<T> {
		addSync(object: T, options?: {}): T;
		fetchSync(): dstore.FetchArray<T>;
		fetchRangeSync(kwArgs: { start?: number; end?: number; }): dstore.FetchArray<T>;
		filter(query: string | {} | { (item: T, index: number): boolean; }): ISyncCollection<T>;
		getSync(id: any): T;
		putSync(object: T, options?: {}): T;
		removeSync(id: any): boolean;
		sort(property: string | { (a: T, b: T): number; }, descending?: boolean): ISyncCollection<T>;
		track?(): ISyncCollection<T>;
	}
}

declare module 'dstore/Cache' {
	import Store = require('dstore/Store');

	class Cache<T> extends Store<T> {
		cachingStore: dstore.ICollection<T>;
		evict(id: any): void;
	}

	export = Cache;
}

declare module 'dstore/legacy/DstoreAdapter' {
	class DstoreAdapter<T> {
		constructor(collection: dstore.ICollection<T>);
		get(id: any): any;
		put(object: T, options?: {}): any;
		remove(id: any): any;
		query(query: any, options?: {}): any;
	}

	export = DstoreAdapter;
}

declare module 'dstore/Memory' {
	import Store = require('dstore/Store');

	class Memory<T> extends Store<T> implements dstore.ISyncCollection<T> {
		data: T[];

		constructor(kwArgs?: Memory.KwArgs<T>);

		addSync(object: T, options?: {}): T;
		fetchSync(): dstore.FetchArray<T>;
		fetchRangeSync(kwArgs: { start?: number; end?: number; }): dstore.FetchArray<T>;
		filter(query: string | {} | { (item: T, index: number): boolean; }): Memory<T>;
		getSync(id: any): T;
		putSync(object: T, options?: {}): T;
		removeSync(id: any): boolean;
		setData(data: T[]): void;
		sort(property: string | { (a: T, b: T): number; }, descending?: boolean): Memory<T>;
		track(): Memory<T>;
	}

	module Memory {
		export interface KwArgs<T> extends Store.KwArgs {
			data?: T[];
		}
	}

	export = Memory;
}

declare module 'dstore/Trackable' {
	class Trackable<T> {
		currentRange: any[];
		track(): dstore.ICollection<T>;
	}

	export = Trackable;
}

declare module 'dstore/Request' {
	import Store = require('dstore/Store');

	class Request<T> extends Store<T> {
		headers: {};
		parse: (serializedObject: string) => {};
		target: string;
		ascendingPrefix: string;
		descendingPrefix: string;
		accepts: string;

		constructor(kwArgs?: Request.KwArgs);

		filter(query: string | {} | { (item: T, index: number): boolean; }): Request<T>;
		sort(property: string | { (a: T, b: T): number; }, descending?: boolean): Request<T>;
		track(): Request<T>;
	}

	module Request {
		export interface KwArgs extends Store.KwArgs {
			headers?: typeof Request.prototype.headers;
			parse?: typeof Request.prototype.parse;
			target?: typeof Request.prototype.target;
			ascendingPrefix?: typeof Request.prototype.ascendingPrefix;
			descendingPrefix?: typeof Request.prototype.descendingPrefix;
			accepts?: typeof Request.prototype.accepts;
		}
	}

	export = Request;
}

declare module 'dstore/RequestMemory' {
	import Request = require('dstore/Request');
	import Cache = require('dstore/Cache');

	class RequestMemory<T> extends Request<T> implements Cache<T> {
		cachingStore: dstore.ICollection<T>;
		evict(id: any): void;

		filter(query: string | {} | { (item: T, index: number): boolean; }): RequestMemory<T>;
		sort(property: string | { (a: T, b: T): number; }, descending?: boolean): RequestMemory<T>;
		track(): RequestMemory<T>;
	}

	export = RequestMemory;
}

declare module 'dstore/Rest' {
	import Request = require('dstore/Request');

	class Rest<T> extends Request<T> {
		filter(query: string | {} | { (item: T, index: number): boolean; }): Rest<T>;
		sort(property: string | { (a: T, b: T): number; }, descending?: boolean): Rest<T>;
		track(): Rest<T>;
	}

	export = Rest;
}

declare module 'dstore/Store' {
	class Store<T> implements dstore.ICollection<T> {
		idProperty: string;
		Model: { new (...args: any[]): T; };
		total: IPromise<number>;

		constructor(kwArgs?: Store.KwArgs);

		add(object: T, options?: {}): IPromise<T>;
		emit(eventName: string, event: dstore.ChangeEvent<T>): boolean;
		fetch(): dstore.FetchPromise<T[]>;
		fetchRange(kwArgs: { start?: number; end?: number; }): dstore.FetchPromise<T[]>;
		filter(query: string | {} | { (item: T, index: number): boolean; }): Store<T>;
		forEach(callback: (item: T, index: number) => void, thisObject?: any): IPromise<T[]>;
		get(id: any): IPromise<T>;
		getIdentity(object: T): any;
		on(eventName: string, listener: (event: dstore.ChangeEvent<T>) => void): IHandle;
		put(object: T, options?: {}): IPromise<T>;
		remove(id: any): IPromise<{}>;
		sort(property: string | { (a: T, b: T): number; }, descending?: boolean): Store<T>;
	}

	module Store {
		export interface KwArgs {
			idProperty?: typeof Store.prototype.idProperty;
			Model?: typeof Store.prototype.Model;
		}
	}

	export = Store;
}
