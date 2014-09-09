/// <reference path="../dstore" />

import core = require('../interfaces');
import ValidationError = require('../validation/ValidationError');
import Validator = require('../validation/Validator');

export interface IModel extends core.IObservable {
	/**
	 * TODO: Figure out how to get rid of this.
	 */
	call:IModel.Callers;

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
	 * Retrieves the proxty for a property on the model.
	 */
	getMetadata(key:string):IProperty<any>;

	/**
	 * Returns whether or not the model currently contains any validation errors.
	 */
	isValid():boolean;

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
	export interface Callers {
		(method:string, ...args:any[]):any;
	}

	export interface Getters extends core.IObservable.Getters {
		(key:'app'):core.IApplication;
		(key:'isExtensible'):boolean;
		(key:'scenario'):string;
	}
	export interface Setters extends core.IObservable.Setters {
		(key:'isExtensible', value:boolean):void;
		(key:'scenario', value:string):void;
	}
}

export interface IPersistentModel extends IModel {
	call:IPersistentModel.Callers;
	get:IPersistentModel.Getters;
	set:IPersistentModel.Setters;

	remove():IPromise<void>;
	save(skipValidation?:boolean):IPromise<void>;
}

export declare module IPersistentModel {
	export interface Callers extends IModel.Callers {
		(method:'remove'):IPromise<void>;
		(method:'save', skipValidation?:boolean):IPromise<void>;
	}

	export interface Getters extends IModel.Getters {
		(key:'store'):dstore.ICollection<IPersistentModel>;
	}

	export interface Setters extends IModel.Setters {
		(key:'store', value:dstore.ICollection<IPersistentModel>):void;
	}
}

export interface IProxyModel<T> extends IModel {
	call:IProxyModel.Callers<T>;
	get:IProxyModel.Getters<T>;
	set:IProxyModel.Setters<T>;
}

export declare module IProxyModel {
	export interface Callers<T> extends IModel.Callers {}
	export interface Getters<T> extends IModel.Getters {
		(key:'model'):T;
	}
	export interface Setters<T> extends IModel.Setters {
		(key:'model', value:T):void;
	}
}

export interface IModelConstructor {
	new (kwArgs?:HashMap<any>):IModel;
	create(schema:any):IModelConstructor;
	property<T>(kwArgs:IProperty.KwArgs<T>):IProperty<T>;
}

export interface IProperty<T> extends core.IObservable {
	get:IProperty.Getters<T>;
	set:IProperty.Setters<T>;

	addError(error:ValidationError):void;
	clearErrors():void;
	validate():IPromise<boolean>;
}

export declare module IProperty {
	export interface KwArgs<T> {
		default?:T;
		dependencies?:string[];
		get?:() => T;
		key?:string;
		label?:string;
		set?:(value:T) => void;
		validateOnSet?:boolean;
		validators?:Validator[];
		value?:T;
	}

	export interface Getters<T> extends core.IObservable.Getters {
		(key:'default'):T;
		(key:'dependencies'):string[];
		(key:'errors'):Array<ValidationError>;
		(key:'key'):string;
		(key:'model'):IModel;
		(key:'label'):string;
		(key:'validateOnSet'):boolean;
		(key:'validators'):Validator[];
		(key:'value'):T;
	}

	export interface Setters<T> extends core.IObservable.Setters {
		(key:'default', value:T):void;
		(key:'dependencies', value:string[]):void;
		(key:'errors', value:Array<ValidationError>):void;
		(key:'key', value:string):void;
		(key:'model', value:IModel):void;
		(key:'label', value:string):void;
		(key:'validateOnSet', value:boolean):void;
		(key:'validators', value:Validator[]):void;
		(key:'value', value:T):void;
	}
}

// TODO: Rename interfaces.d.ts to ../<package name>.d.ts
