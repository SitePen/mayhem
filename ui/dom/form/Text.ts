/// <reference path="../../../dijit" />

import DijitWidget = require('../DijitWidget');
import DijitText = require('dijit/form/ValidationTextBox');
import IText = require('../../form/Text');
import util = require('../../../util');

class Text extends DijitWidget implements IText {
	static Ctor = DijitText;
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

Text.prototype._autoCommit = false;
Text.prototype._placeholder = '';
Text.prototype._readOnly = false;
Text.prototype._value = '';

module Text {
	export interface Events extends DijitWidget.Events, IText.Events {}
	export interface Getters extends DijitWidget.Getters, IText.Getters {}
	export interface Setters extends DijitWidget.Setters, IText.Setters {}
}

export = Text;
