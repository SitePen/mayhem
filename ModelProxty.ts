/// <reference path="./dojo" />

import core = require('./interfaces');
import Proxty = require('./Proxty');
import ValidationError = require('./validation/ValidationError');

class ModelProxty<T> extends Proxty<T> implements core.IModelProxty<T> {
	default:T;
	errors:core.IProxty<ValidationError[]>;
	label:string; // TODO: Proxty?
	validators:core.IValidator[];
	validateOnSet:boolean;

	constructor(kwArgs:{
		default?:T;
		errors?:core.IProxty<ValidationError[]>;
		label?:string;
		validators?:core.IValidator[];
	});
	constructor(initialValue:T);
	constructor(kwArgs:any) {
		if (typeof kwArgs !== 'object') {
			kwArgs = { 'default': kwArgs };
		}

		this.errors = new Proxty<ValidationError[]>([]);
		this.validators = kwArgs.validators || [];
		this.validateOnSet = kwArgs.validateOnSet != null ? kwArgs.validateOnSet : true;
		super(kwArgs.default);
	}

	addError(error:ValidationError):void {
		this.errors.set(this.errors.get().concat(error));
	}

	clearErrors():void {
		this.errors.set([]);
	}

	getErrors():ValidationError[] {
		return this.errors.get();
	}

	// TODO: Wrong
	validate:() => void;
}

export = ModelProxty;
