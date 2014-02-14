import DijitTextBox = require('dijit/form/TextBox');
import DijitWidget = require('../DijitWidget');
import util = require('../../../util');

class FormInput extends DijitWidget {
	/* protected */ _dijit:DijitTextBox;
	private _debounceRate:number;
	private _listenHandle:IHandle;

	// TODO: TS#2153
	// get(key:'debounceRate'):number;
	// get(key:'value'):string;
	// set(key:'debounceRate', value:number):void;
	// set(key:'value', value:string):void;

	constructor(kwArgs?:Object) {
		this._setDijitCtor(DijitTextBox);
		this._setDijitFields('checked', 'value');
		util.deferMethods(this, [ '_listen' ], '_render');
		this._debounceRate = 100;
		super(kwArgs);
	}

	_debounceRateSetter(value:number):void {
		this._debounceRate = value;
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
		}, this._debounceRate));
	}

	/* protected */ _render():void {
		this._dijitArgs.intermediateChanges = true;
		super._render();
		this._listen();
	}
}

export = FormInput;
