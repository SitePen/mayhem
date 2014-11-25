/// <reference path="../../../dijit" />

import DijitWidget = require('../DijitWidget');
import DijitTextarea = require('dijit/form/Textarea');
import ITextarea = require('../../form/Textarea');
import util = require('../../../util');

class Textarea extends DijitWidget implements ITextarea {
	static Ctor = DijitTextarea;
	static setupMap = util.deepCreate(DijitWidget.setupMap, {
		properties: {
			placeholder: 'placeHolder',
			readOnly: 'readOnly',
			value: 'value'
		}
	});

	get:Textarea.Getters;
	on:Textarea.Events;
	set:Textarea.Setters;

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

Textarea.prototype._placeholder = '';
Textarea.prototype._readOnly = false;
Textarea.prototype._value = '';

module Textarea {
	export interface Events extends DijitWidget.Events, ITextarea.Events {}
	export interface Getters extends DijitWidget.Getters, ITextarea.Getters {}
	export interface Setters extends DijitWidget.Setters, ITextarea.Setters {}
}

export = Textarea;
