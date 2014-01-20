/// <reference path="./dojo" />

import core = require('./interfaces');
import Proxty = require('./Proxty');

class ModelProxty<T> extends Proxty<T> implements core.IModelProxty<T> {
	default:T;
	errors:core.IProxty<Error[]>;
	label:string; // TODO: Proxty?
	validators:core.IValidator[];

	constructor(kwArgs:{
		default?:T;
		label?:string;
		validators?:core.IValidator[];
	});
	constructor(initialValue:T);
	constructor(kwArgs:any) {
		if (typeof kwArgs !== 'object') {
			kwArgs = { 'default': kwArgs };
		}

		this.validators = [];
		super(kwArgs.default);
	}

	validate:() => IPromise<void>;
}

export = ModelProxty;
