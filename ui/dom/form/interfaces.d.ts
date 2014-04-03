import dom = require('../interfaces');
import form = require('../../form/interfaces');

export interface IButton extends form.IButton, dom.IText {
	get:form.IButtonGet;
	set:form.IButtonSet;
}

export interface IError extends form.IError, dom.IList {
	get:form.IErrorGet;
	set:form.IErrorSet;
}

export interface ILabel extends form.ILabel, dom.IText {
	get:form.ILabelGet;
	set:form.ILabelSet;
}

export interface IToggleButton extends form.IToggleButton, IButton {
	get:form.IToggleButtonGet;
	set:form.IToggleButtonSet;
}
