import dom = require('../interfaces');
import form = require('../../form/interfaces');

export interface IError extends form.IError, dom.IElementWidget {
	_observerHandle:IHandle;

	get:IErrorGet;
	set:IErrorSet;
}
export interface IErrorGet extends form.IErrorGet {}
export interface IErrorSet extends form.IErrorSet {}

export interface ILabel extends form.ILabel, dom.IElementWidget {
	get:ILabelGet;
	set:ILabelSet;
}
export interface ILabelGet extends form.ILabelGet {}
export interface ILabelSet extends form.ILabelSet {}
