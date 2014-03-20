import dom = require('../interfaces');
import form = require('../../form/interfaces');
import ui = require('../../interfaces');

export interface ILabel extends dom.IElementWidget, form.ILabel {
	get:ILabelGet;
	set:ILabelSet;
}
export interface ILabelGet extends ui.IWidgetGet, form.ILabelGet {}
export interface ILabelSet extends ui.IWidgetGet, form.ILabelSet {}
