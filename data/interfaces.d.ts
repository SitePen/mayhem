import core = require('../interfaces');
import ValidationError = require('../validation/ValidationError');

/**
 * The IModel interface should be implemented by any object that is intended to be used as a data model within the
 * framework.
 */
export interface IModel extends core.IComponent, core.IObservable {
	/**
	 * The current validation scenario for the model. Defaults to 'insert' for new models, and 'update' for existing
	 * models.
	 */
	scenario:string;

	addError(key:string, error:ValidationError):void;

	/**
	 * Retrieves the value of a property on the model.
	 */
	get(key:string):any;

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
export interface IProperty<T> extends core.IObservable {
	get(key:'default'):T;
	// TODO: Make into ObservableArray?
	get(key:'errors'):ValidationError[];
	get(key:'key'):string;
	get(key:'model'):IModel;
	get(key:'label'):string;
	get(key:'validators'):core.IValidator[];
	get(key:string):void;
}

export interface IPropertyArguments<T> {
	default?:T;
	errors?:core.IProxty<ValidationError[]>;
	key?:string;
	model?:IModel;
	label?:string;
	validators?:core.IValidator[];
}

// TODO: Rename interfaces.d.ts to ../<package name>.d.ts
