import core = require('../../interfaces');
import ui = require('../interfaces');

export interface IButton extends IControl {
	get:IButtonGet;
	set:IButtonSet;
}

export interface IButtonGet extends IControlGet {
	(name:'label'):string;
	(name:'type'):string;
}

export interface IButtonSet extends IControlSet {
	(name:'label', value:string):void;
	(name:'type', value:string):void;
}

export interface IButtonValues extends IControlValues {
	label?:string;
	type?:string;
}

export interface ICheckBox extends IToggleButton {
	get:ICheckBoxGet;
	set:ICheckBoxSet;
}

export interface ICheckBoxGet extends IToggleButtonGet {
	(name:'indeterminate'):boolean;
}

export interface ICheckBoxSet extends IToggleButtonSet {
	(name:'indeterminate', value:string):boolean;
}

export interface ICheckBoxValues extends IButtonValues {
	indeterminate?:string;
}

export interface IControl extends ui.IWidget {
	get:IControlGet;
	set:IControlSet;
}

export interface IControlGet extends ui.IWidgetGet {
	(name:'disabled'):boolean;
	(name:'tabindex'):number;
}

export interface IControlSet extends ui.IWidgetSet {
	(name:'disabled', value:boolean):void;
	(name:'tabindex', value:number):void;
}

export interface IControlValues extends ui.IWidgetValues {
	disabled?:boolean;
	tabindex?:boolean;
}

export interface IError extends ui.IWidget {
	get:IErrorGet;
	set:IErrorSet;
}

export interface IErrorGet extends ui.IWidgetGet {
	(name:'list'):core.IValidationError[];
}

export interface IErrorSet extends ui.IWidgetSet {
	(name:'list', value:core.IValidationError[]):void;
}

export interface IErrorValues extends ui.IWidgetValues {
	list?:core.IValidationError[];
}

export interface IInput extends IControl {
	get:IInputGet;
	set:IInputSet;
}

export interface IInputGet extends IControlGet {
	(name:'name'):string;
	(name:'readonly'):boolean;
}

export interface IInputSet extends IControlSet {
	(name:'name', value:string):void;
	(name:'readonly', value:boolean):void;
}

export interface IInputValues extends IControlValues {
	name?:string;
	readonly?:boolean;
}

export interface ILabel extends ui.IWidget {
	get:ILabelGet;
	set:ILabelSet;
	_values:ILabelValues;
}

export interface ILabelGet extends ui.IWidgetGet {
	(name:'for'):string;
	(name:'formattedText'):string;
	(name:'text'):string;
}

export interface ILabelSet extends ui.IWidgetSet {
	(name:'for', value:string):void;
	(name:'formattedText', value:string):void;
	(name:'text', value:string):void;
}

export interface ILabelValues extends ui.IWidgetValues {
	for?:string;
	formattedText?:string;
	text?:string;
}

export interface IRadioButton extends ICheckBox {
	get:IRadioButtonGet;
	set:IRadioButtonSet;
}

export interface IRadioButtonGet extends ICheckBoxGet {
	(name:'group'):string;
}

export interface IRadioButtonSet extends ICheckBoxSet {
	(name:'group', value:string):string;
}

export interface IRadioButtonValues extends ICheckBoxValues {
	group?:string;
}

export interface ITextarea extends ITextInput {
	get:ITextInputGet;
	set:ITextInputSet;
}

export interface ITextareaGet extends ITextInputGet {
	(name:'cols'):number;
	(name:'rows'):number;
}

export interface ITextareaSet extends ITextInputSet {
	(name:'cols', value:number):void;
	(name:'rows', value:number):void;
}

export interface ITextareaValues extends ITextInputValues {
	cols?:number;
	rows?:number;
}

export interface ITextInput extends IInput {
	get:ITextInputGet;
	set:ITextInputSet;
}

export interface ITextInputGet extends IInputGet {
	(name:'maxlength'):number;
	(name:'placeholder'):string;
	(name:'trim'):boolean;
	(name:'value'):string;
}

export interface ITextInputSet extends IInputSet {
	(name:'maxlength', value:number):void;
	(name:'placeholder', value:string):void;
	(name:'trim', value:boolean):void;
	(name:'value', value:string):void;
}

export interface ITextInputValues extends IInputValues {
	maxlength?:number;
	placeholder?:string;
	trim?:boolean;
	value?:string;
}

export interface IToggleButton extends IButton {
	get:IToggleButtonGet;
	set:IToggleButtonSet;
}

export interface IToggleButtonGet extends IButtonGet {
	(name:'checked'):boolean;
}

export interface IToggleButtonSet extends IButtonSet {
	(name:'checked', value:string):boolean;
}

export interface IToggleButtonValues extends IButtonValues {
	checked?:boolean;
}
