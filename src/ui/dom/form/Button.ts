import DijitButton = require('dijit/form/Button');
import DijitWidget = require('../DijitWidget');
import IButton = require('../../form/Button');
import util = require('../../../util');

class Button extends DijitWidget implements IButton {
	static Ctor = DijitButton;
	static setupMap = util.deepCreate(DijitWidget.setupMap, {
		properties: {
			formattedLabel: 'label',
			icon: 'iconClass'
		}
	});

	get:Button.Getters;
	on:Button.Events;
	set:Button.Setters;

	/**
	 * @get
	 * @set
	 * @protected
	 */
	_formattedLabel:string;

	/**
	 * @get
	 * @set
	 * @protected
	 */
	_icon:string;

	_formattedLabelGetter():string {
		return this._formattedLabel;
	}
	_formattedLabelSetter(value:string):void {
		var oldFormattedLabel = this._formattedLabel;
		this._formattedLabel = value;
		// TODO: Notify interface should not require values to be passed, should get them from the object, to avoid
		// this unnecessary extra work when there are no label observers
		this._notify('label', util.unescapeXml(value), util.unescapeXml(oldFormattedLabel));
	}

	_labelGetter():string {
		return util.unescapeXml(this._formattedLabel);
	}

	_labelSetter(value:string):void {
		this.set('formattedLabel', util.escapeXml(value));
	}
}

Button.prototype._formattedLabel = '';

module Button {
	export interface Events extends DijitWidget.Events, IButton.Events {}
	export interface Getters extends DijitWidget.Getters, IButton.Getters {}
	export interface Setters extends DijitWidget.Setters, IButton.Setters {}
}

export = Button;
