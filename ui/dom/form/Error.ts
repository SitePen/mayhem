import binding = require('../../../binding/interfaces');
import core = require('../../../interfaces');
import domConstruct = require('dojo/dom-construct');
import domUtil = require('../util');
import lang = require('dojo/_base/lang');
import SingleNodeWidget = require('../SingleNodeWidget');
import ValidationError = require('../../../validation/ValidationError');

class FormError extends SingleNodeWidget {
	binding:string;
	private _errorsHandle:IHandle;
	firstNode:HTMLUListElement;
	private _propertyHandle:IHandle;
	lastNode:HTMLUListElement;
	private __updateBinding:() => void;
	private __updateDisplay:(errors:ValidationError[]) => void;

	constructor(kwArgs:Object) {
		super(kwArgs);
		this.__updateBinding = <() => void> lang.hitch(this, '_updateBinding');
		this.__updateDisplay = <(errors:ValidationError[]) => void> lang.hitch(this, '_updateDisplay');
	}

	private _bindingSetter(value:string):void {
		this.binding = value;
		this.app.scheduler.schedule(this.id, this.__updateBinding);
	}

	/* protected */ _mediatorSetter(value:core.IMediator):void {
		super._mediatorSetter(value);
		this.app.scheduler.schedule(this.id, this.__updateBinding);
	}

	render():void {
		this.firstNode = this.lastNode = document.createElement('ul');
	}

	private _updateBinding():void {
		this._propertyHandle && this._propertyHandle.remove();
		this._propertyHandle = this.app.binder
			.createProxty<core.IModelProxty<any>, core.IModelProxty<any>>(this.mediator, this.binding)
			.observe((modelProxty:core.IModelProxty<any>) => {
				this._errorsHandle && this._errorsHandle.remove();
				this._errorsHandle = modelProxty.errors.observe(this.__updateDisplay);
			});
	}

	private _updateDisplay(errors:ValidationError[]):void {
		this.firstNode.innerHTML = '';

		if (!errors) {
			return;
		}

		for (var i = 0, error:Error; (error = errors[i]); i++) {
			var element = domConstruct.create('li', {}, this.firstNode);
			element.appendChild(document.createTextNode(error.toString()));
		}
	}

	destroy():void {
		this._errorsHandle && this._errorsHandle.remove();
		this._propertyHandle && this._propertyHandle.remove();
		this._errorsHandle = this._propertyHandle = null;

		super.destroy();
	}
}

export = FormError;
