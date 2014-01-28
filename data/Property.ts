/// <reference path="../dojo" />

import core = require('../interfaces');
import data = require('./interfaces');
import Observable = require('../Observable');
import Proxty = require('../Proxty');
import ValidationError = require('../validation/ValidationError');

class Property<T> extends Observable implements data.IProperty<T> {
	private default:T;
	// TODO: Use ObservableArray
	private errors:ValidationError[];
	private key:string;
	private model:data.IModel;
	private label:string; // TODO: Proxty?
	private validators:core.IValidator[];
	private validateOnSet:boolean;

	constructor(kwArgs:data.IPropertyArguments<T>) {
		this.errors = [];
		this.validators = [];
		this.validateOnSet = true;

		super(kwArgs);
	}

	get(key:'default'):T;
	get(key:'errors'):ValidationError[];
	get(key:'key'):string;
	get(key:'model'):data.IModel;
	get(key:'label'):string;
	get(key:'validators'):core.IValidator[];
	get(key:'validateOnSet'):boolean;
	get(key:string):any;
	get(key:string):any {
		return super.get(key);
	}
}

export = Property;
