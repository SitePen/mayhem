import binding = require('../../../binding/interfaces');
import core = require('../../../interfaces');
import domConstruct = require('dojo/dom-construct');
import domUtil = require('../util');
import DstoreProperty = require('../../../binding/properties/Dstore');
import lang = require('dojo/_base/lang');
import SingleNodeWidget = require('../SingleNodeWidget');

class FormError extends SingleNodeWidget {
	private _errorsHandle:IHandle;
	firstNode:HTMLUListElement;
	private _propertyHandle:IHandle;
	model:string;
	property:string;
	lastNode:HTMLUListElement;

	private _bindingSetter(value:string):void {
		this.binding = value;

		this._propertyHandle && this._propertyHandle.remove();
		this._propertyHandle = this.app.binder
			.createProxty(this.mediator, value)
			.observe((modelProxty:core.IModelProxty<any>) => {
				this._errorsHandle && this._errorsHandle.remove();
				this._errorsHandle = modelProxty.errors.observe(<(value:Error[]) => void> lang.hitch(this, '_updateDisplay'));
			});
	}

	render():void {
		this.firstNode = this.lastNode = document.createElement('ul');
	}

	private _updateDisplay(errors:Error[] /* TODO: ValidationError[] */):void {
		this.firstNode.innerHTML = '';

		if (!errors) {
			return;
		}

		for (var i = 0, error:Error; (error = errors[i]); i++) {
			var element = domConstruct.create('li', {}, this.firstNode);
			// TODO: Figure out where human-readable name comes from
			element.appendChild(document.createTextNode(error.toString(/*{
				name: this.field
			}*/)));
		}
	}

	destroy():void {
		this._property.destroy();
		this._property = null;

		super.destroy();
	}
}

export = FormError;
