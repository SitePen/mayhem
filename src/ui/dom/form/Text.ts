import DijitWidget = require('../DijitWidget');
import DijitText = require('dijit/form/ValidationTextBox');
import DijitTextarea = require('dijit/form/SimpleTextarea');
import IText = require('../../form/Text');
import KeyboardType = require('../../form/KeyboardType');
import util = require('../../../util');

class Text extends DijitWidget implements IText {
	static setupMap = util.deepCreate(DijitWidget.setupMap, {
		properties: {
			autoCommit: 'intermediateChanges',
			placeholder: 'placeHolder',
			readOnly: 'readOnly',
			value: 'value'
		}
	});

	get:Text.Getters;
	on:Text.Events;
	set:Text.Setters;

	/**
	 * @get
	 * @set
	 * @protected
	 */
	_autoCommit:boolean;

	_isMultiLine:boolean;
	_isMultiLineGetter():boolean {
		return this._isMultiLine;
	}
	_isMultiLineSetter(value:boolean):void {
		if (value === this._isMultiLine) {
			return;
		}

		this._isMultiLine = value;
		this._render();
	}

	/**
	 * @get
	 * @set
	 * @protected
	 */
	_isSecureEntry:boolean;
	_isSecureEntryGetter():boolean {
		return this._isSecureEntry;
	}
	_isSecureEntrySetter(value:boolean):void {
		if (value === this._isSecureEntry || this._isMultiLine) {
			return;
		}

		var htmlType = value ? 'password' : 'text';

		this._isSecureEntry = value;
		// Dijit does not allow programmatic change of the type of an input
		this._widget.textbox.type = htmlType;
	}

	/**
	* @get
	* @set
	* @protected
	*/
	_keyboardType:KeyboardType;
	_keyboardTypeGetter():KeyboardType {
		return this._keyboardType;
	}
	_keyboardTypeSetter(value:KeyboardType):void {
		if (this._keyboardType === value || this._isMultiLine) {
			return;
		}

		this._keyboardType = value;

		var htmlInput:any = this._widget.textbox;
		var useInputMode:boolean = 'inputMode' in htmlInput;
		var htmlType:string;
		switch (value) {
			case KeyboardType.DEFAULT:
				htmlType = useInputMode ? null : (this._isSecureEntry ? 'password' : 'text');
				break;
			case KeyboardType.URL:
				htmlType = 'url';
				break;
			case KeyboardType.NUMBER:
				htmlType = useInputMode ? 'numeric' : 'number';
				break;
			case KeyboardType.TELEPHONE:
				htmlType = 'tel';
				break;
			case KeyboardType.EMAIL:
				htmlType = 'email';
				break;
		}

		if (useInputMode) {
			htmlInput.inputMode = htmlType;
		}
		else {
			htmlInput.type = htmlType;
		}
	}

	/**
	 * @get
	 * @set
	 * @protected
	 */
	_placeholder:string;

	/**
	 * @get
	 * @set
	 * @protected
	 */
	_readOnly:boolean;

	/**
	 * @get
	 * @set
	 * @protected
	 */
	_value:string;

	_widget:DijitText;

	constructor(kwArgs?:HashMap<any>) {
		util.deferSetters(this, [ 'isSecureEntry', 'keyboardType' ], '_render');
		util.deferSetters(this, [ 'isMultiLine' ], '_render', function (_, value) {
			this._isMultiLine = value;
		});
		super(kwArgs);
	}

	_initialize():void {
		super._initialize();
		this._autoCommit = false;
		this._keyboardType = KeyboardType.DEFAULT;
		this._isMultiLine = false;
		this._isSecureEntry = false;
		this._placeholder = '';
		this._readOnly = false;
		this._value = '';
	}

	/**
	 * @override
	 */
	_render():void {
		var isMultiLine = this.get('isMultiLine');
		var Ctor = isMultiLine ? DijitTextarea : DijitText;

		var widget = new Ctor();

		if (this._widget) {
			this._node.parentNode.replaceChild(widget.domNode, this._node);
			this._widget.destroyRecursive();
		}

		this._widget = widget;
		this._node = widget.domNode;
		(<any> this._node).widget = this;

		this._bindWidget();

		if (this.get('isAttached')) {
			widget.startup();
		}
	}
}

module Text {
	export interface Events extends DijitWidget.Events, IText.Events {}
	export interface Getters extends DijitWidget.Getters, IText.Getters {}
	export interface Setters extends DijitWidget.Setters, IText.Setters {}
}

export = Text;
