import DijitWidget = require('../DijitWidget');
import DijitText = require('dijit/form/ValidationTextBox');
import DijitTextarea = require('dijit/form/SimpleTextarea');
import IText = require('../../form/Text');
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

	_initialize():void {
		super._initialize();
		this._autoCommit = false;
		this._isMultiLine = false;
		this._placeholder = '';
		this._readOnly = false;
		this._value = '';
	}

	/**
	 * @override
	 */
	_render():void {
		var Ctor = this.get('isMultiLine') ? DijitTextarea : DijitText;

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
