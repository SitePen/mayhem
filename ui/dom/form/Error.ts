import core = require('../../../interfaces');
import domConstruct = require('dojo/dom-construct');
import domUtil = require('../util');
import lang = require('dojo/_base/lang');
import SingleNodeWidget = require('../SingleNodeWidget');

class FormError extends SingleNodeWidget {
	field:string;
	firstNode:HTMLUListElement;
	lastNode:HTMLUListElement;
	private _property:core.IModelProperty;
	private _propertyHandle:IHandle;

	private _fieldSetter(value:string):void {
		this.field = value;
		var property:core.IModelProperty = this._property = this.mediator.get('model').property(this.field).property('errors');
		this._propertyHandle = property.receive(<(value:any) => void> lang.hitch(this, '_updateDisplay'));
	}

	render():void {
		this.firstNode = this.lastNode = document.createElement('ul');
	}

	private _updateDisplay(errors:any):void {
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
		this._propertyHandle.remove();
		this._property = this._propertyHandle = null;

		super.destroy();
	}
}

export = FormError;
