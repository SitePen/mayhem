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

export interface ICheckbox extends IInput, ISwitch {
	get:ICheckboxGet;
	set:ICheckboxSet;
}

export interface ICheckboxGet extends IInputGet, ISwitchGet {
}

export interface ICheckboxSet extends IInputSet, ISwitchSet {
}

export interface ICheckboxValues extends IInputValues, ISwitchValues {
}

export interface IControl extends ui.IWidget {
	get:IControlGet;
	set:IControlSet;
}

export interface IControlGet extends ui.IWidgetGet {
	(name:'disabled'):boolean;
}

export interface IControlSet extends ui.IWidgetSet {
	(name:'disabled', value:boolean):void;
}

export interface IControlValues extends ui.IWidgetValues {
	disabled?:boolean;
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
	(name:'value'):any;
}

export interface IInputSet extends IControlSet {
	(name:'name', value:string):void;
	(name:'readonly', value:boolean):void;
	(name:'value', value:any):void;
}

export interface IInputValues extends IControlValues {
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
}

export interface ILabelSet extends ui.IWidgetSet {
	(name:'for', value:string):void;
}

export interface ILabelValues extends ui.IWidgetValues {
	for?:string;
}

export interface IRadioButton extends ICheckbox {
	get:IRadioButtonGet;
	set:IRadioButtonSet;
}

export interface IRadioButtonGet extends ICheckboxGet {
}

export interface IRadioButtonSet extends ICheckboxSet {
}

export interface IRadioButtonValues extends ICheckboxValues {
}

export interface ISwitch extends IControl {
	get:ISwitchGet;
	set:ISwitchSet;
}

export interface ISwitchGet extends IControlGet {
	(name:'checked'):boolean;
	(name:'indeterminate'):boolean;
}

export interface ISwitchSet extends IControlSet {
	(name:'checked', value:boolean):void;
	(name:'indeterminate', value:boolean):void;
}

export interface ISwitchValues extends IControlValues {
	checked?:boolean;
	indeterminate?:boolean;
}

export interface ITextArea extends ITextField {
	get:ITextAreaGet;
	set:ITextAreaSet;
}

export interface ITextAreaGet extends ITextFieldGet {
	(name:'columns'):number;
	(name:'rows'):number;
}

export interface ITextAreaSet extends ITextFieldSet {
	(name:'columns', value:number):void;
	(name:'rows', value:number):void;
}

export interface ITextAreaValues extends ITextFieldValues {
	columns?:number;
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

export interface IToggleButton extends IButton, ISwitch {
	get:IToggleButtonGet;
	set:IToggleButtonSet;
}

export interface IToggleButtonGet extends IButtonGet, ISwitchGet {
}

export interface IToggleButtonSet extends IButtonSet, ISwitchSet {
}

export interface IToggleButtonValues extends IButtonValues, ISwitchValues {
}
