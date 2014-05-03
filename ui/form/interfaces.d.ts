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

export interface ICheckbox extends IInput, ISwitch {
	get:ICheckboxGet;
	set:ICheckboxSet;
}
export interface ICheckboxGet extends IInputGet, ISwitchGet {}
export interface ICheckboxSet extends IInputSet, ISwitchSet {}

export interface IError extends ui.IWidget {
	get:IErrorGet;
	set:IErrorSet;
}
export interface IErrorGet extends ui.IWidgetGet {
	(name:'source'):core.IValidationError[];
}
export interface IErrorSet extends ui.IWidgetSet {
	(name:'source', value:core.IValidationError[]):void;
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

export interface ILabel extends ui.IWidget {
	get:ILabelGet;
	set:ILabelSet;
}
export interface ILabelGet extends ui.IWidgetGet {
	(name:'for'):string;
}
export interface ILabelSet extends ui.IWidgetSet {
	(name:'for', value:string):void;
}

export interface IRadioButton extends ICheckbox {
	get:IRadioButtonGet;
	set:IRadioButtonSet;
}
export interface IRadioButtonGet extends ICheckboxGet {}
export interface IRadioButtonSet extends ICheckboxSet {}

export interface ISwitch extends ui.IWidget {
	get:ISwitchGet;
	set:ISwitchSet;
}
export interface ISwitchGet extends ui.IWidgetGet {
	(name:'selected'):boolean;
}
export interface ISwitchSet extends ui.IWidgetSet {
	(name:'selected', value:boolean):void;
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

export interface IToggleButton extends IButton, ISwitch {
	get:IToggleButtonGet;
	set:IToggleButtonSet;

	toggle(forceState?:boolean):void;
}
export interface IToggleButtonGet extends IButtonGet, ISwitchGet {}
export interface IToggleButtonSet extends IButtonSet, ISwitchSet {}
