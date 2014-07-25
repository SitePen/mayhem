/// <reference path="./dojo" />

import Deferred = require('dojo/Deferred');
import DojoPromise = require('dojo/promise/Promise');
import lang = require('dojo/_base/lang');
import whenAll = require('dojo/promise/all');

class Promise<T> implements IPromise<T> {
	static all = whenAll;

	static resolve<U>(value:IPromise<U>):IPromise<U>;
	static resolve<U>(value:U):IPromise<U>;
	static resolve<U>(value:U):IPromise<U> {
		if (value instanceof DojoPromise) {
			return <any> value;
		}

		if (value instanceof Deferred) {
			return <any> (<any> value).promise;
		}

		var dfd:IDeferred<U> = new Deferred();
		dfd.resolve(value);
		return dfd.promise;
	}

	static reject(error:Error):IPromise<Error> {
		var dfd:IDeferred<Error> = new Deferred();
		dfd.reject(error);
		return dfd.promise;
	}

	constructor(initializer:(
		resolve?:(value:T) => void,
		reject?:(error:Error) => void,
		progress?:(update:any) => void,
		setCanceler?:(canceler:(reason?:Error) => any) => void
	) => void) {
		var canceler:(reason?:Error) => any;
		var dfd = new Deferred(function (reason:Error):any {
			return canceler && canceler(reason);
		});

		try {
			initializer(
				lang.hitch(dfd, 'resolve'),
				lang.hitch(dfd, 'reject'),
				lang.hitch(dfd, 'progress'),
				function (_canceler:(reason?:Error) => any):void {
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

export = Promise;
