import binding = require('../../../binding/interfaces');
import core = require('../../../interfaces');
import data = require('../../../data/interfaces');
import domConstruct = require('dojo/dom-construct');
import domUtil = require('../util');
import SingleNodeWidget = require('../SingleNodeWidget');
import util = require('../../../util');
import ValidationError = require('../../../validation/ValidationError');

class FormError extends SingleNodeWidget {
	private _binding:string;
	private _errorsProxty:core.IProxty<ValidationError[]>;
	/* protected */ _firstNode:HTMLUListElement;
	/* protected */ _lastNode:HTMLUListElement;

	// TODO: TS#2153
	// get(key:'binding'):string;
	// set(key:'binding', value:string):void;

	constructor(kwArgs?:Object) {
		util.deferMethods(this, [ '_updateDisplay' ], '_render');
		util.deferMethods(this, [ '_updateBinding' ], '_parentMediatorSetter');
		super(kwArgs);
	}

	private _bindingSetter(value:string):void {
		this._binding = value;
		this._updateBinding();
	}

	destroy():void {
		this._errorsProxty && this._errorsProxty.destroy();
		this._errorsProxty = null;

		super.destroy();
	}

	/* protected */ _mediatorSetter(value:core.IMediator):void {
		super._mediatorSetter(value);
		this._updateBinding();
	}

	/* protected */ _render():void {
		this._firstNode = this._lastNode = document.createElement('ul');
	}

	private _updateBinding():void {
		this._errorsProxty && this._errorsProxty.destroy();

		var mediator = this.get('mediator');
		if (!mediator || !this._binding) {
			return;
		}

		var proxty = this.get('app').get('binder').getMetadata<ValidationError[]>(mediator, this._binding, 'errors');
		this._errorsProxty = proxty;
		proxty.observe((errors:ValidationError[]):void => {
			this._updateDisplay(errors);
		});
	}

	private _updateDisplay(errors:ValidationError[]):void {
		this._firstNode.innerHTML = '';

		if (!errors) {
			return;
		}

		for (var i = 0, error:ValidationError; (error = errors[i]); i++) {
			var element = domConstruct.create('li', {}, this._firstNode);
			element.appendChild(document.createTextNode(error.toString()));
		}
	}
}

export = FormError;
