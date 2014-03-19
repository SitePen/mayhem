import ui = require('../interfaces');
// TODO validation.IValidationError?
export import ValidationError = require('../../validation/ValidationError');

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

export interface IButtonImpl extends IButton, IControlImpl {
	_values:IButtonValues;
	get:IButtonGet;
	set:IButtonSet;
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

export interface ICheckBoxImpl extends ICheckBox, IButtonImpl {
	_values:ICheckBoxValues;
	get:ICheckBoxGet;
	set:ICheckBoxSet;
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

export interface IControlImpl extends IControl, ui.IWidgetImpl {
	_values:IControlValues;
	get:IControlGet;
	set:IControlSet;
}

export interface IError extends ui.IWidget {
	get:IErrorGet;
	set:IErrorSet;
}

export interface IErrorGet extends ui.IWidgetGet {
	(name:'errors'):ValidationError[];
}

export interface IErrorSet extends ui.IWidgetSet {
	(name:'errors', value:ValidationError[]):void;
}

export interface IErrorValues extends ui.IWidgetValues {
	errors?:ValidationError[];
}

export interface IErrorImpl extends IError, ui.IWidgetImpl {
	_values:IErrorValues;
	get:IErrorGet;
	set:IErrorSet;
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

export interface IInputImpl extends IInput, IControlImpl {
	_values:IInputValues;
	get:IInputGet;
	set:IInputSet;
}

export interface ILabel extends ui.IWidget {
	get:ILabelGet;
	set:ILabelSet;
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

export interface ILabelImpl extends ILabel, ui.IWidgetImpl {
	get:ILabelGet;
	set:ILabelSet;
	_values:ILabelValues;
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

export interface IRadioButtonImpl extends IRadioButton, ICheckBoxImpl {
	_values:IRadioButtonValues;
	get:IRadioButtonGet;
	set:IRadioButtonSet;
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

export interface ITextareaImpl extends ITextarea, ITextInputImpl {
	_values:ITextareaValues;
	get:ITextInputGet;
	set:ITextInputSet;
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

export interface ITextInputImpl extends ITextInput, IInputImpl {
	get:ITextInputGet;
	set:ITextInputSet;
	_values:ITextInputValues;
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

export interface IToggleButtonImpl extends IToggleButton, IButtonImpl {
	_values:IToggleButtonValues;
	get:IToggleButtonGet;
	set:IToggleButtonSet;
}
