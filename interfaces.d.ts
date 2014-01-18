// TODO: Ensure all reference paths are updated to be module IDs
/// <reference path="./dojo" />

import binding = require('./binding/interfaces');
import ValidationError = require('./validators/ValidationError');

export interface IApplication {
	binder:binding.IBinder;
	scheduler:IScheduler;
}

export interface IComponent {
	app:IApplication;
}

export interface IMediator extends IComponent {
	model:IModel;
	routeState:Object;
}

/**
 * The IModel interface should be implemented by any object that is intended to be used as a data model within the
 * framework.
 */
export interface IModel extends IComponent {
	/**
	 * The current validation scenario for the model. Defaults to 'insert' for new models, and 'update' for existing
	 * models.
	 */
	scenario:string;

	addError(key:string, error:Error /* TODO: ValidationError */):void;

	/**
	 * Retrieves the value of a property on the model.
	 */
	get(key:string):any;

	/**
	 * Retrieves the proxty for a property on the model.
	 */
	// getProxty(key:string):IProxty<any>;

	/**
	 * Returns whether or not the model currently contains any validation errors.
	 */
	isValid():boolean;

	/**
	 * Removes the model from its source store.
	 */
	remove():any;

	/**
	 * Saves the model to its source store.
	 *
	 * @param skipValidation
	 * Passing `true` will cause the validation step to be skipped. By default, validation will occur before the
	 * model is saved.
	 *
	 * @returns
	 * A promise that resolves when the data has been successfully saved, or is rejected with error if the store
	 * reports a failure to save the data or if valiation fails.
	 */
	save(skipValidation?:boolean):IPromise<void>;

	/**
	 * Sets the value of a property on the model.
	 */
	set(value:{ [key:string]:any }):void;
	set(key:string, value:any):void;

	/**
	 * Validates the data model.
	 *
	 * @param keys
	 * Passing a list of keys will cause only those keys to be validated. By default, all keys on the model are
	 * validated.
	 *
	 * @returns
	 * A promise that resolves when validation completes, or is rejected with error if there is an unhandled exception
	 * during validation. The resolved value is `true` if the model validated successfully, or `false` if the model
	 * experienced a validation failure. Once validated, errors can be retrieved by calling
	 * `Model#getMetadata('errors')` (for all model errors) or `Model#property(key).getMetadata('errors')` for a
	 * specific field.
	 */
	validate(keys?:string[]):IPromise<boolean>;
}

/**
 * The IModelProxty interface extends a standard proxty with additional methods for data validation.
 */
export interface IModelProxty<T> extends IProxty<T> {
	default:T;
	// TODO: Make into StatefulArray?
	// TODO: TS 0.9.1 has a bug that means can't use IProxty<ValidationError[]> because it claims it is a private type
	errors:IProxty<Error[]>;
	label:string;
	validators:IValidator[];

	/**
	 * Validates the underlying value of the proxty.
	 */
	validate():void;
}

export interface IObserver<T> {
	(newValue:T, oldValue:T):void;
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
	validate(model:any/*IModel*/, key:string, proxty:IModelProxty<any>):void;
}
