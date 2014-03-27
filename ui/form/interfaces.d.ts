import core = require('../../interfaces');
import ui = require('../interfaces');

export interface IButton extends ui.IWidget {
	get:IButtonGet;
	set:IButtonSet;
}

export interface IButtonGet extends ui.IWidgetGet {
	(name:'label'):string;
	(name:'type'):string;
}

export interface IButtonSet extends ui.IWidgetSet {
	(name:'label', value:string):void;
	(name:'type', value:string):void;
}

export interface IButtonValues extends ui.IWidgetValues {
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

export interface IInput extends ui.IWidget {
	get:IInputGet;
	set:IInputSet;
}

export interface IInputGet extends ui.IWidgetGet {
	(name:'name'):string;
	(name:'readonly'):boolean;
	(name:'value'):any;
}

export interface IInputSet extends ui.IWidgetSet {
	(name:'name', value:string):void;
	(name:'readonly', value:boolean):void;
	(name:'value', value:any):void;
}

export interface IInputValues extends ui.IWidgetValues {
	name?:string;
	readonly?:boolean;
	value?:any;
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

export interface ITextArea extends ITextField {
	get:ITextAreaGet;
	set:ITextAreaSet;
}

export interface ITextAreaGet extends ITextFieldGet {
	(name:'cols'):number;
	(name:'rows'):number;
}

export interface ITextAreaSet extends ITextFieldSet {
	(name:'cols', value:number):void;
	(name:'rows', value:number):void;
}

export interface ITextAreaValues extends ITextFieldValues {
	cols?:number;
	rows?:number;
}

export interface ITextField extends IInput {
	get:ITextFieldGet;
	set:ITextFieldSet;
}

export interface ITextFieldGet extends IInputGet {
	(name:'maxlength'):number;
	(name:'placeholder'):string;
	(name:'trim'):boolean;
	(name:'value'):string;
}

export interface ITextFieldSet extends IInputSet {
	(name:'maxlength', value:number):void;
	(name:'placeholder', value:string):void;
	(name:'trim', value:boolean):void;
	(name:'value', value:string):void;
}

export interface ITextFieldValues extends IInputValues {
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
