import core = require('../interfaces');
import ObservableArray = require('../ObservableArray');

export interface IMediator extends IModel {
	get:IMediatorGet;
	/* protected */ _observers:{ [key:string]: core.IObserver<any>[]; };
	set:IMediatorSet;
}

export interface IMediatorGet extends IModelGet {
	(key:'model'):IModel;
	(key:'routeState'):Object;
}

export interface IMediatorSet extends IModelSet {
	(key:'model', value:IModel):void;
	(key:'routeState', value:Object):void;
}

/**
 * The IModel interface should be implemented by any object that is intended to be used as a data model within the
 * framework.
 */

export interface IModel extends core.IApplicationComponent {
	addError(key:string, error:core.ValidationError):void;

	/**
	 * Retrieves the value of a property on the model.
	 */
	get:IModelGet;

	/**
	 * Retrieves the proxty for a property on the model.
	 */
	getMetadata(key:string):IProperty<any>;

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
	set:IModelSet;

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

export interface IModelGet extends core.IApplicationComponentGet {
	(key:'collection'):any;
	(key:'scenario'):string;
	(key:'isExtensible'):boolean;
}

export interface IModelSet extends core.IApplicationComponentSet {
	(key:'scenario', value:string):void;
}

export interface IModelConstructor {
	new (kwArgs?:{ [key:string]: any; }):IModel;
	create(schema:any):IModelConstructor;
	property<T>(kwArgs:IPropertyArguments<T>):IProperty<T>;
}

/**
 * The IModelProxty interface extends a standard proxty with additional methods for data validation.
 */
export interface IProperty<T> extends core.IObservable {
	get:IPropertyGet<T>;
	set:IPropertySet<T>;
	validate():IPromise<boolean>;
}

export interface IPropertyGet<T> extends core.IObservableGet {
	(key:'default'):T;
	(key:'dependencies'):string[];
	// TODO: Make into ObservableArray?
	(key:'errors'):ObservableArray<core.ValidationError>;
	(key:'key'):string;
	(key:'model'):IModel;
	(key:'label'):string;
	(key:'validateOnSet'):boolean;
	(key:'validators'):core.IValidator[];
	(key:'value'):T;
	():Object;
}

export interface IPropertySet<T> extends core.IObservableSet {
	(key:'default', value:T):void;
	(key:'dependencies', value:string[]):void;
	(key:'errors', value:ObservableArray<core.ValidationError>):void;
	(key:'key', value:string):void;
	(key:'model', value:IModel):void;
	(key:'label', value:string):void;
	(key:'validateOnSet', value:boolean):void;
	(key:'validators', value:core.IValidator[]):void;
	(key:'value', value:T):void;
}

export interface IPropertyArguments<T> {
	[key:string]:any;
	get?:() => T;
	dependencies?:string[];
	label?:string;
	set?:(value:T) => void;
	value?:T;
	validateOnSet?:boolean;
	validators?:core.IValidator[];
}

// TODO: Rename interfaces.d.ts to ../<package name>.d.ts
