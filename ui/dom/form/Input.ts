import DijitWidget = require('../DijitWidget');
import TextBox = require('dijit/form/TextBox');
import util = require('../../../util');

class FormInput extends DijitWidget {
	/* protected */ _dijit:TextBox;
	private _debounceRate:number;
	private _listenHandle:IHandle;
	private _value:string;

	// TODO: TS#2153
	// get(key:'debounceRate'):number;
	// get(key:'value'):string;
	// set(key:'debounceRate', value:number):void;
	// set(key:'value', value:string):void;

	constructor(kwArgs?:Object) {
		util.deferMethods(this, [ '_listen' ], '_render');
		util.deferSetters(this, [ 'value' ], '_render');
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
		this._dijit = new TextBox({
			id: this._dijitId,
			intermediateChanges: true
		});
		super._render();
		this._listen();
	}

	_valueSetter(value:string):void {
		this._value = value;
		this._dijit.set('value', value);
	}
}

export = FormInput;
