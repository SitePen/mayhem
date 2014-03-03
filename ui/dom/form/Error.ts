import BindDirection = require('../../../binding/BindDirection');
import binding = require('../../../binding/interfaces');
import core = require('../../../interfaces');
import data = require('../../../data/interfaces');
import domConstruct = require('dojo/dom-construct');
import domUtil = require('../util');
import ElementWidget = require('../ElementWidget');
import util = require('../../../util');
import ValidationError = require('../../../validation/ValidationError');

class FormError extends ElementWidget {
	private _binding:string;
	private _errors:ValidationError[];
	private _errorsProxty:core.IProxty<ValidationError[]>;
	/* protected */ _firstNode:HTMLUListElement;
	/* protected */ _lastNode:HTMLUListElement;

	// TODO: TS#2153
	// get(key:'binding'):string;
	// set(key:'binding', value:string):void;

	constructor(kwArgs?:Object) {
		util.deferMethods(this, [ '_errorsSetter' ], '_render');
		super(kwArgs);
	}

	/* protected */ _bind(target:any, targetBinding:string, binding:string, options:{ direction?:BindDirection; } = {}):binding.IBindingHandle {
		if (targetBinding === 'binding') {
			targetBinding = 'errors';
			binding += '!errors';
		}
		return super._bind(target, targetBinding, binding, options);
	}

	destroy():void {
		this._errorsProxty && this._errorsProxty.destroy();
		this._errorsProxty = null;

		super.destroy();
	}

	/* protected */ _errorsSetter(errors:ValidationError[]):void {
		this._errors = errors;
		this._firstNode.innerHTML = '';

		if (!errors) {
			return;
		}

		for (var i = 0, error:ValidationError; (error = errors[i]); i++) {
			var element = domConstruct.create('li', {}, this._firstNode);
			element.appendChild(document.createTextNode(error.toString()));
		}
	}

	/* protected */ _render():void {
		this._firstNode = this._lastNode = document.createElement('ul');
	}
}

export = FormError;
