import _DijitWidget = require('dijit/form/TextBox');
import _FormValueWidget = require('./_FormValueWidget');
import util = require('../../../util');

class TextBox extends _FormValueWidget {
	static _dijitConfig:any = {
		// _TextBoxMixin
		trim: 'boolean',
		uppercase: 'boolean',
		lowercase: 'boolean',
		propercase: 'boolean',
		maxLength: 'string',
		selectOnClick: 'boolean',
		placeHolder: 'string',
		onInput: { action: true }
	};
	static _DijitWidget:typeof _DijitWidget = _DijitWidget;

	private _debounceRate:number;
	private _listenHandle:IHandle;

	// TODO: TS#2153
	// get(key:'debounceRate'):number;
	// get(key:'value'):string;
	// set(key:'debounceRate', value:number):void;
	// set(key:'value', value:string):void;

	constructor(kwArgs?:Object) {
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

TextBox.configure(_FormValueWidget);

export = TextBox;
