import dijit = require('../dijit/interfaces');
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

export interface IControl extends ui.IElement, dijit.IWidgetBase {
	get:IControlGet;
	set:IControlSet;
}

export interface IControlGet extends ui.IElementGet {
	(name:'disabled'):boolean;
	(name:'tabindex'):number;
}

export interface IControlSet extends ui.IElementSet {
	(name:'disabled', value:boolean):void;
	(name:'tabindex', value:number):void;
}

export interface IError extends ui.IElement {
	get:IErrorGet;
	set:IErrorSet;
}

export interface IErrorArgs /* extends ui.IElementArgs */ {
	errors?:ValidationError[];
}

export interface IErrorGet extends ui.IElementGet {
	(name:'errors'):ValidationError[];
}

export interface IErrorSet extends ui.IElementSet {
	(name:'errors', value:ValidationError[]):void;
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

export interface ILabel extends ui.IElement {
	get:ILabelGet;
	set:ILabelSet;
}

export interface ILabelArgs /* extends ui.IElementArgs */ {
	for?:string;
	formattedText?:string;
	text?:string;
}

export interface ILabelGet extends ui.IElementGet {
	(name:'for'):string;
	(name:'formattedText'):string;
	(name:'text'):string;
}

export interface ILabelSet extends ui.IElementSet {
	(name:'for', value:string):void;
	(name:'formattedText', value:string):void;
	(name:'text', value:string):void;
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
