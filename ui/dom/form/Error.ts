import binding = require('../../../binding/interfaces');
import core = require('../../../interfaces');
import domConstruct = require('dojo/dom-construct');
import domUtil = require('../util');
import DstoreProperty = require('../../../binding/properties/Dstore');
import lang = require('dojo/_base/lang');
import SingleNodeWidget = require('../SingleNodeWidget');

class FormError extends SingleNodeWidget {
	binding:string;
	firstNode:HTMLUListElement;
	private _handle:IHandle;
	lastNode:HTMLUListElement;

	private _bindingSetter(value:string):void {
		this.binding = value;

		this._handle && this._handle.remove();
		this._handle = this.app.binder
			.createProxty(this.mediator, value)
			// problem: this fixes our observation to the one specific proxty even though a parent might change
			.getMetadata('errors')
			.observe(<(value:Error[]) => void> lang.hitch(this, '_updateDisplay'));

		var binder = this.app.binder;
		var errors:core.IProxty<Error[]> = binder.createProxty(binder.createProxty(this.mediator, value), 'errors');
		this._handle = errors.observe(<(value:Error[]) => void> lang.hitch(this, '_updateDisplay'));
	}

	render():void {
		this.firstNode = this.lastNode = document.createElement('ul');
	}

	private _updateDisplay(errors:Error[]):void {
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
