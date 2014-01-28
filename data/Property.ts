/// <reference path="../dojo" />

import core = require('../interfaces');
import data = require('./interfaces');
import Observable = require('../Observable');
import ObservableArray = require('../ObservableArray');
import Proxty = require('../Proxty');
import ValidationError = require('../validation/ValidationError');

class Property<T> extends Observable implements data.IProperty<T> {
	private errors:ObservableArray<ValidationError>;
	private key:string;
	private model:data.IModel;
	private label:string;
	private validators:core.IValidator[];
	private validateOnSet:boolean;
	private value:T;
	private _valueGetter:() => T;

	constructor(kwArgs?:data.IPropertyArguments<T>) {
		this.errors = new ObservableArray<ValidationError>();
		this.validators = [];
		this.validateOnSet = true;

		super(kwArgs);
	}

	observe<T>(key:string, observer:core.IObserver<T>):IHandle {
		var handle = super.observe(key, observer);

		if (key === 'errors') {
			this.errors.observe(():void => {
				this._notify(this.errors, this.errors, 'errors');
			});
		}

		return handle;
	}

	validate():IPromise<boolean> {
		// TODO: Move validation loop from Model to Property
		return this.model && this.model.validate([ this.key ]);
	}

	_valueSetter(value:T):void {
		this.value = value;
		this.validateOnSet && this.validate();
	}

	_valueSetterSetter(setter:(value:T) => void):void {
		this._valueSetter = function () {
			setter.apply(this, arguments);
			this.validateOnSet && this.validate();
		};
	}
}

export = Property;
