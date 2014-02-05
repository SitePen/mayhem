import DijitWidget = require('../DijitWidget');
import TextBox = require('dijit/form/TextBox');
import util = require('../../../util');

class FormInput extends DijitWidget {
	/* protected */ _dijit:TextBox;
	debounceRate:number;
	private _listenHandle:IHandle;
	value:string;

	constructor(kwArgs:Object = {}) {
		util.deferMethods(this, [ '_listen' ], '_render');
		util.deferSetters(this, [ 'value' ], '_render');
		this.debounceRate = 100;
		super(kwArgs);
	}

	_debounceRateSetter(value:number):void {
		this.debounceRate = value;
		this._listen();
	}

	destroy():void {
		this._listenHandle && this._listenHandle.remove();
		this._listenHandle = null;
		super.destroy();
	}

	_listen():void {
		this._listenHandle && this._listenHandle.remove();
		this._listenHandle = this._dijit.watch('value', util.debounce((key:string, oldValue:string, newValue:string):void => {
			this.set('value', newValue);
		}, this.debounceRate));
	}

	/* protected */ _render():void {
		this._dijit = new TextBox({ intermediateChanges: true });
		super._render();
		this._listen();
	}

	_valueSetter(value:string):void {
		this.value = value;
		this._dijit.set('value', value);
	}
}

export = FormInput;
