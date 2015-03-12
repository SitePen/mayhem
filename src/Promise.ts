/// <reference path="../typings/tsd" />

import Deferred = require('dojo/Deferred');
import DojoPromise = require('dojo/promise/Promise');
import lang = require('dojo/_base/lang');
import whenAll = require('dojo/promise/all');

class Promise<T> implements IPromise<T> {
	static all = whenAll;

	static Deferred = Deferred;

	static reject(error:Error):IPromise<Error> {
		var dfd:IDeferred<Error> = new Deferred();
		dfd.reject(error);
		return dfd.promise;
	}

	static resolve<U>(value:IPromise<U>):IPromise<U>;
	static resolve<U>(value:U):IPromise<U>;
	static resolve<U>(value:U):IPromise<U> {
		if (value instanceof DojoPromise || value instanceof Promise) {
			return <any> value;
		}

		if (value instanceof Deferred) {
			return <any> (<any> value).promise;
		}

		return new Promise(function (resolve) {
			resolve(value);
		});
	}

	constructor(initializer:(
		resolve?:Promise.IResolver<T>,
		reject?:Promise.IRejecter,
		progress?:Promise.IProgress,
		setCanceler?:(canceler:Promise.ICanceler) => void
	) => void) {
		var canceler:Promise.ICanceler;
		var dfd = new Deferred(function (reason:Error):any {
			return canceler && canceler(reason);
		});

		try {
			initializer(
				function (value:T|Promise<T>) {
					if (value && (<Promise<T>> value).then) {
						var promise = <Promise<T>> value;
						promise.then(
							lang.hitch(dfd, 'resolve'),
							lang.hitch(dfd, 'reject'),
							lang.hitch(dfd, 'progress')
						);
						if (promise.cancel) {
							canceler = (function (oldCanceler:Promise.ICanceler) {
								return function (reason:Error) {
									promise.cancel(reason);
									oldCanceler && oldCanceler(reason);
								};
							})(canceler);
						}
					}
					else {
						dfd.resolve(value);
					}
				},
				lang.hitch(dfd, 'reject'),
				lang.hitch(dfd, 'progress'),
				function (_canceler:Promise.ICanceler):void {
					canceler = _canceler;
				}
			);
		}
		catch (error) {
			dfd.reject(error);
		}

		return dfd.promise;
	}

	always:<U>(callback:(valueOrError:any) => U) => IPromise<U>;
	cancel:<U>(reason?:U, strict?:boolean) => U;
	isCanceled:() => boolean;
	isFulfilled:() => boolean;
	isRejected:() => boolean;
	isResolved:() => boolean;
	otherwise:{
		<U>(errback:(reason:any) => IPromise<U>):IPromise<U>;
		<U>(errback:(reason:any) => U):IPromise<U>;
	};
	then:{
		<U>(callback:(value:T) => IPromise<U>, errback?:(reason:any) => IPromise<U>, progback?:(update:any) => IPromise<U>):IPromise<U>;
		<U>(callback:(value:T) => IPromise<U>, errback?:(reason:any) => U,           progback?:(update:any) => IPromise<U>):IPromise<U>;
		<U>(callback:(value:T) => U,           errback?:(reason:any) => IPromise<U>, progback?:(update:any) => IPromise<U>):IPromise<U>;
		<U>(callback:(value:T) => U,           errback?:(reason:any) => U,           progback?:(update:any) => IPromise<U>):IPromise<U>;
		<U>(callback:(value:T) => IPromise<U>, errback?:(reason:any) => IPromise<U>, progback?:(update:any) => U):IPromise<U>;
		<U>(callback:(value:T) => IPromise<U>, errback?:(reason:any) => U,           progback?:(update:any) => U):IPromise<U>;
		<U>(callback:(value:T) => U,           errback?:(reason:any) => IPromise<U>, progback?:(update:any) => U):IPromise<U>;
		<U>(callback:(value:T) => U,           errback?:(reason:any) => U,           progback?:(update:any) => U):IPromise<U>;
	};
}

module Promise {
	export interface ICanceler {
		(reason:Error):any;
	}
	export interface IProgress {
		(update:any):void;
	}
	export interface IRejecter {
		(error:Error):void;
	}
	export interface IResolver<T> {
		(value:Promise<T>):void;
		(value:T):void;
	}
}

export = Promise;
