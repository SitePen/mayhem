import dom = require('../interfaces');
import form = require('../../form/interfaces');

export interface IError extends form.IError, dom.IElementWidget {
	_observerHandle:IHandle;

	get:form.IErrorGet;
	set:form.IErrorSet;
}

export interface ILabel extends form.ILabel, dom.ITextView {
	_values:form.ILabelValues;

	get:form.ILabelGet;
	set:form.ILabelSet;
}
