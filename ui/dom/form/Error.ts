import binding = require('../../../binding/interfaces');
import core = require('../../../interfaces');
import domConstruct = require('dojo/dom-construct');
import domUtil = require('../util');
import lang = require('dojo/_base/lang');
import SingleNodeWidget = require('../SingleNodeWidget');
import ValidationError = require('../../../validation/ValidationError');

class FormError extends SingleNodeWidget {
	binding:string;
	private _bindingProxty:core.IModelProxty<any>;
	private _errorsHandle:IHandle;
	firstNode:HTMLUListElement;
	lastNode:HTMLUListElement;
	private __updateBinding:() => void;

	constructor(kwArgs:Object) {
		super(kwArgs);
		this.__updateBinding = <() => void> lang.hitch(this, '_updateBinding');
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
/*		this._errorsHandle && this._errorsHandle.remove();
		this._bindingProxty && this._bindingProxty.destroy();

		if (!this.mediator || !this.binding) {
			return;
		}

		// TODO: Replace with some new getMetadata function from binder
		var proxty = this._bindingProxty = <core.IModelProxty<any>> <any> this.app.binder.createProxty<core.IModelProxty<any>, core.IModelProxty<any>>(this.mediator, this.binding);

		if (!proxty.errors) {
			throw new Error('Attempting to bind to a non-model proxty');
		}

		this._errorsHandle = proxty.errors.observe((errors:ValidationError[]) => {
			this._updateDisplay(errors);
		});*/
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
		this._errorsHandle && this._errorsHandle.remove();
		this._bindingProxty && this._bindingProxty.destroy();
		this._errorsHandle = this._bindingProxty = null;

		super.destroy();
	}
}

export = FormError;
