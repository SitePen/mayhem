/// <reference path="./dojo" />

import binding = require('./binding/interfaces');
import data = require('./data/interfaces');
import ObservableArray = require('./ObservableArray');
import ValidationError = require('./validation/ValidationError');

export interface IApplication {
	binder:binding.IBinder;
	scheduler:IScheduler;
}

export interface IArrayObserver<T> {
	(atIndex:number, insertedItems:ObservableArray<T>, removedItems:ObservableArray<T>):void;
}

export interface IComponent {
	app:IApplication;
}

export interface IMediator extends IComponent, IObservable {
	model:data.IModel;
	routeState:Object;
}

export interface IObservable {
	get(key:string):any;
	// TODO: invokeImmediately?
	observe<T>(key:string, observer:IObserver<T>):IHandle;
	set(kwArgs:{ [key:string]: any; }):void;
	set(key:string, value:any):void;
}

export interface IObserver<T> {
	(newValue:T, oldValue:T, key?:string):void;
}

export interface IHasMetadata {
	getMetadata(key:string):IObservable;
}

/**
 * A proxty object is an opaque object that represents a mutable value, typically an arbitrary property of an object,
 * that can be observed for changes and accessed without knowing the location of the original object or the name of
 * the property.
 */
export interface IProxty<T> {
	/**
	 * Permanently destroys the binding to the original property.
	 */
	destroy():void;

	/**
	 * Retrieves the value stored in the proxty.
	 */
	get():T;

	/**
	 * Provides a mechanism for positively identifying a proxty object, since its interfaces are too generic for
	 * reliable duck typing.
	 */
	isProxty:boolean;

	/**
	 * Registers an observer that will be called whenever the value of the proxty changes.
	 */
	observe(observer:IObserver<T>, invokeImmediately?:boolean):IHandle;

	/**
	 * Replaces the value of the proxty with a new value. Observers will be notified of the set at some point in the
	 * future.
	 */
	set(value:T):void;

	/**
	 * Implementing `valueOf` enables a proxty object to be used directly as an operand in EcmaScript expressions,
	 * converting automatically into its stored primitive value.  This method will normally return the same value as
	 * `get`, except in cases where the underlying value may have a different `valueOf` (like Date objects), in which
	 * case the `valueOf` of the underlying value will be used.
	 */
	valueOf():any;
}

export interface IRoute {
	router:IRouter;
}

export interface IRouter {
	createPath:(routeId:string, kwArgs:Object) => string;
	defaultRoute:string;
	destroy:() => void;
	go:(routeId:string, kwArgs:Object) => void;
	normalizeId:(routeId:string) => string;
	notFoundRoute:string;
	pause:() => void;
	resetPath:(path:string, replace:boolean) => void;
	resume:() => void;
	startup:() => IPromise<void>;
}

export interface IScheduler {
	afterNext(callback:Function):void;
	dispatch():void;
	schedule(id:string, callback:Function):void;
}

export interface IValidatorOptions {
	allowEmpty?:boolean;
	scenarios?:string[];
}

export interface IValidator {
	options?:IValidatorOptions;
	validate(model:data.IModel, key:string, value:any):void;
}
