/// <reference path="../../../dijit" />

import DijitWidget = require('../DijitWidget');
import DijitText = require('dijit/form/ValidationTextBox');
import IText = require('../../form/Text');

class Text extends DijitWidget implements IText {
	static Ctor = DijitText;
	static setupMap = {
		properties: {
			disabled: 'disabled',
			id: 'id',
			placeHolder: 'placeholder',
			readOnly: 'readOnly',
			value: 'value'
		},
		events: {
			blur: function ():void {
				this.set('focused', false);
			},
			focus: function ():void {
				this.set('focused', true);
			}
		}
	};

	/**
	 * @get
	 * @set
	 * @protected
	 */
	_disabled:boolean;

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
}

Text.prototype._disabled = false;
Text.prototype._placeholder = '';
Text.prototype._readOnly = false;
Text.prototype._value = '';

module Text {
	export interface Events extends DijitWidget.Events, IText.Events {}
	export interface Getters extends DijitWidget.Getters, IText.Getters {}
	export interface Setters extends DijitWidget.Setters, IText.Setters {}
}

export = Text;
