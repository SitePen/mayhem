import core = require('../interfaces');
import ValidationError = require('../validation/ValidationError');
import Validator = require('../validation/Validator');

export interface IModel extends core.IObservable {
	/**
	 * Retrieves the value of a property on the model.
	 */
	get:IModel.Getters;

	/**
	 * Sets the value of a property on the model.
	 */
	set:IModel.Setters;

	addError(key:string, error:ValidationError):void;

	clearErrors(key?:string):void;

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

export declare module IModel {
	export interface Getters extends core.IObservable.Getters {
		(key:'app'):core.IApplication;
		(key:'autoSave'):boolean;
		(key:'autoValidate'):boolean;
		(key:'isDirty'):boolean;
		(key:'isExtensible'):boolean;
		(key:'isValid'):boolean;
		(key:'labels'):HashMap<string>;
		(key:'scenario'):string;
		(key:'scenarios'):HashMap<string[]>;
		(key:'validators'):HashMap<Validator[]>;
	}
	export interface Setters extends core.IObservable.Setters {
		(key:'autoSave', value:boolean):void;
		(key:'autoValidate', value:boolean):void;
		(key:'isExtensible', value:boolean):void;
		(key:'labels', value:HashMap<string>):void;
		(key:'scenario', value:string):void;
		(key:'scenarios', value:HashMap<string[]>):void;
		(key:'validators', value:HashMap<Validator[]>):void;
	}
}

export interface IPersistentModel extends IModel {
	get:IPersistentModel.Getters;
	set:IPersistentModel.Setters;

	remove():IPromise<void>;
	save(skipValidation?:boolean):IPromise<void>;
}

export declare module IPersistentModel {
	export interface Getters extends IModel.Getters {
		(key:'store'):dstore.ICollection<IPersistentModel>;
	}

	export interface Setters extends IModel.Setters {
		(key:'store', value:dstore.ICollection<IPersistentModel>):void;
	}
}

export interface IProxyModel<T> extends IModel {
	get:IProxyModel.Getters<T>;
	set:IProxyModel.Setters<T>;
}

export declare module IProxyModel {
	export interface Getters<T> extends IModel.Getters {
		(key:'model'):T;
	}
	export interface Setters<T> extends IModel.Setters {
		(key:'model', value:T):void;
	}
}

export interface IModelConstructor {
	new (kwArgs?:HashMap<any>):IModel;
}

// TODO: Rename interfaces.d.ts to ../<package name>.d.ts
