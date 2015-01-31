import domConstruct = require('dojo/dom-construct');
import domUtil = require('./util');
import ILabel = require('../Label');
import MultiNodeWidget = require('./MultiNodeWidget');
import util = require('../../util');

class Label extends MultiNodeWidget implements ILabel {
	get:Label.Getters;
	on:Label.Events;
	set:Label.Setters;

	/**
	 * @get
	 * @set
	 * @protected
	 */
	_formattedText:string;

	/**
	 * @get
	 * @set
	 * @protected
	 */
	_text:string;

	constructor(kwArgs:HashMap<any>) {
		util.deferSetters(this, [ 'formattedText' ], '_render');
		super(kwArgs);
	}

	_formattedTextGetter():string {
		return this._formattedText;
	}
	_formattedTextSetter(value:string):void {
		domUtil.extractContents(this._firstNode, this._lastNode, true);

		var content:DocumentFragment = <any> domConstruct.toDom(value);

		var oldTextValue:string = this._text;
		this._text = content.textContent || (<any> content).innerText;

		this._lastNode.parentNode.insertBefore(content, this._lastNode);
		this._formattedText = value;

		this._notify('text', this._text, oldTextValue);
	}

	_textGetter():string {
		return this._text;
	}
	_textSetter(value:string):void {
		this.set('formattedText', util.escapeXml(value));
	}
}

module Label {
	export interface Events extends MultiNodeWidget.Events, ILabel.Events {}
	export interface Getters extends MultiNodeWidget.Getters, ILabel.Getters {}
	export interface Setters extends MultiNodeWidget.Setters, ILabel.Setters {}
}

export = Label;
