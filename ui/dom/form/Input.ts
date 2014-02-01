/// <reference path="../../../dijit" />

import SingleNodeWidget = require('../SingleNodeWidget');
import TextBox = require('dijit/form/TextBox');
import util = require('../../../util');
import widget = require('../../interfaces');

class FormInput extends SingleNodeWidget {
	private _dijit:TextBox;
	debounceRate:number;
	firstNode:HTMLElement;
	lastNode:HTMLElement;
	private _listenHandle:IHandle;
	value:string;

	constructor(kwArgs:Object = {}) {
		util.deferMethods(this, [ '_listen', '_parentSetter', '_valueSetter' ], '_render');
		this.debounceRate = 100;
		util.deferSetters(this, [ 'value' ], 'render');
		super(kwArgs);
	}

	_debounceRateSetter(value:number):void {
		this.debounceRate = value;
		this._listen();
	}

	destroy():void {
		this._listenHandle && this._listenHandle.remove();
		this._dijit && this._dijit.destroyRecursive();
		this._dijit = this._listenHandle = null;
		super.destroy();
	}

	_listen():void {
		this._listenHandle && this._listenHandle.remove();
		this._listenHandle = this._dijit.watch('value', util.debounce((key:string, oldValue:string, newValue:string):void => {
			this.set('value', newValue);
		}, this.debounceRate));
	}

	_parentSetter(value:widget.IContainerWidget):void {
		this.parent = value;

		if (document.documentElement.contains(this.firstNode)) {
			this._dijit.startup();
		}
		// TODO: otherwise, we need to start when the parent starts, whenever that is, whatever that means
	}

	/* protected */ _render():void {
		this._dijit = new TextBox({ intermediateChanges: true });
		this.classList.set(this._dijit.domNode.className);
		this.firstNode = this.lastNode = this._dijit.domNode;
		this._listen();
	}

	_valueSetter(value:string):void {
		this.value = value;
		this._dijit.set('value', value);
	}
}

export = FormInput;
