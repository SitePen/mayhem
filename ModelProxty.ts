/// <reference path="./dojo" />

import core = require('./interfaces');
import Proxty = require('./Proxty');
import ValidationError = require('./validation/ValidationError');

class ModelProxty<T> extends Proxty<T> implements core.IModelProxty<T> {
	default:T;
	errors:core.IProxty<Error[]>;
	label:string; // TODO: Proxty?
	validators:core.IValidator[];

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
		super(kwArgs.default);
	}

	validate:() => IPromise<void>;

	getErrors():Error[] {
		return this.errors.get();
	}

	addError(error:Error /* ValidationError */):void {
		this.errors.set(this.errors.get().concat(error));
	}

	clearErrors():void {
		this.errors.set([]);
	}
}

export = ModelProxty;
