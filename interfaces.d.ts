/// <reference path="./dojo" />

export import binding = require('./binding/interfaces');
export import data = require('./data/interfaces');
import IEvented = require('dojo/Evented');
export import ObservableArray = require('./ObservableArray');
export import routing = require('./routing/interfaces');
export import ValidationError = require('./validation/ValidationError');

export interface IApplication extends IObservable {
	get:IApplicationGet;
}

export interface IApplicationGet extends IObservableGet {
	(key:'binder'):binding.IBinder;
	(key:'router'):routing.IRouter;
	(key:'scheduler'):IScheduler;
}

export interface IArrayObserver<T> {
	(atIndex:number, insertedItems:ObservableArray<T>, removedItems:ObservableArray<T>):void;
}

export interface IApplicationComponent {
	get:IApplicationComponentGet;
	set:IApplicationComponentSet;
}

export interface IApplicationComponentGet extends IObservableGet {
	(key:'app'):IApplication;
}

export interface IApplicationComponentSet extends IObservableSet {
}

export interface IObservable {
	get:IObservableGet;
	// TODO: invokeImmediately?
	observe<T>(key:string, observer:IObserver<T>):IHandle;
	set:IObservableSet;
}

export interface IObservableGet {
	(key:string):any;
}

export interface IObservableSet {
	(kwArgs:{ [key:string]: any; }):void;
	(key:string, value:any):void;
}

export interface IObservableEvented extends IObservable, IEvented {
}

export interface IObserver<T> {
	(newValue:T, oldValue:T, key?:string):void;
}

export interface IHasMetadata {
	getMetadata(key:string):IObservable;
}

export interface IProperty<T> {
	destroy():void;
	get():T;
	isProperty:boolean;
	observe(observer:IObserver<T>):IHandle;
	set(value:T):void;
	valueOf():any;
}

export interface IProxy extends IObservable {
	destroy():void;
	setTarget(observable:IObservable):void;
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
