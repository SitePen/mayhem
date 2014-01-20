/// <reference path="./dojo" />

import core = require('./interfaces');
import Proxty = require('./Proxty');

class ModelProxty<T> extends Proxty<T> implements core.IModelProxty<T> {
	default:T;
	label:string; // TODO: Proxty?
	errors:core.IProxty<Error[]>;
	validators:core.IValidator[];

	constructor(kwArgs:{
		default?:T;
		label?:string;
		errors?:core.IProxty<Error[]>;
		validators?:core.IValidator[];
	});
	constructor(initialValue:T);
	constructor(kwArgs:any) {
		if (typeof kwArgs !== 'object') {
			kwArgs = { 'default': kwArgs };
		}

		this.validators = [];
		super(kwArgs.default);
		this.errors = new Proxty([]);
		this.validators = kwArgs.validators || [];
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
