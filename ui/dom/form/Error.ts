import binding = require('../../../binding/interfaces');
import core = require('../../../interfaces');
import data = require('../../../data/interfaces');
import domConstruct = require('dojo/dom-construct');
import domUtil = require('../util');
import lang = require('dojo/_base/lang');
import SingleNodeWidget = require('../SingleNodeWidget');
import util = require('../../../util');
import ValidationError = require('../../../validation/ValidationError');

class FormError extends SingleNodeWidget {
	binding:string;
	private _errorsProxty:core.IProxty<ValidationError[]>;
	firstNode:HTMLUListElement;
	lastNode:HTMLUListElement;

	constructor(kwArgs?:Object) {
		util.deferMethods(this, [ '_updateDisplay' ], 'render');
		super(kwArgs);
	}

	private _bindingSetter(value:string):void {
		this.binding = value;
		this._updateBinding();
	}

	/* protected */ _mediatorSetter(value:core.IMediator):void {
		super._mediatorSetter(value);
		this._updateBinding();
	}

	render():void {
		this.firstNode = this.lastNode = document.createElement('ul');
	}

	private _updateBinding():void {
		this._errorsProxty && this._errorsProxty.destroy();

		var mediator = this.get('mediator');
		if (!mediator || !this.binding) {
			return;
		}

		var proxty = this._errorsProxty = <core.IProxty<ValidationError[]>> this.app.binder.getMetadata(mediator, this.binding, 'errors');
		proxty.observe((errors:ValidationError[]) => {
			this._updateDisplay(errors);
		});
	}

	private _updateDisplay(errors:ValidationError[]):void {
		this.firstNode.innerHTML = '';

		if (!errors) {
			return;
		}

		for (var i = 0, error:ValidationError; (error = errors[i]); i++) {
			var element = domConstruct.create('li', {}, this.firstNode);
			element.appendChild(document.createTextNode(error.toString()));
		}
	}

	destroy():void {
		this._errorsProxty && this._errorsProxty.destroy();
		this._errorsProxty = null;

		super.destroy();
	}
}

export = FormError;
