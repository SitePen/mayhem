import dijit = require('../interfaces');

export interface IButton extends IFormWidget {
	get:IButtonGet;
	set:IButtonSet;
}

export interface IButtonGet extends IFormWidgetGet {
	(name:'label'):string;
	(name:'type'):string;
	(name:'onClick'):Function;
	(name:'showLabel'):boolean;
	(name:'iconClass'):string;
}

export interface IButtonSet extends IFormWidgetSet {
	(name:'label', value:string):void;
	(name:'type', value:string):void;
	(name:'onClick', value:Function):void;
	(name:'showLabel', value:boolean):void;
	(name:'iconClass', value:string):void;
}

export interface IButtonMixin extends dijit.IMixin {
	get:IButtonMixinGet;
	set:IButtonMixinSet;
}

export interface IButtonMixinGet extends dijit.IMixinGet {
	(name:'label'):string;
	(name:'onClick'):Function;
	(name:'type'):string;
}

export interface IButtonMixinSet extends dijit.IMixinSet {
	(name:'label', value:string):void;
	(name:'onClick', value:Function):void;
	(name:'type', value:string):void;
}

export interface ICheckBox extends IToggleButton {
	get:ICheckBoxGet;
	set:ICheckBoxSet;
}

export interface ICheckBoxGet extends IToggleButtonGet {
	(name:'readOnly'):boolean;
}

export interface ICheckBoxSet extends IToggleButtonSet {
	(name:'readOnly', value:boolean):void;
}

export interface ICheckBoxMixin extends dijit.IMixin {
	get:ICheckBoxMixinGet;
	set:ICheckBoxMixinSet;
}

export interface ICheckBoxMixinGet extends dijit.IMixinGet {
	(name:'readOnly'):boolean;
}

export interface ICheckBoxMixinSet extends dijit.IMixinSet {
	(name:'readOnly', value:boolean):void;
}

export interface IFormValueWidget extends IFormWidget, IFormValueMixin {
	get:IFormValueWidgetGet;
	set:IFormValueWidgetSet;
}

export interface IFormValueWidgetGet extends IFormWidgetGet, IFormValueMixinGet {
}

export interface IFormValueWidgetSet extends IFormWidgetSet, IFormValueMixinSet {
}

export interface IFormWidget extends dijit.IWidget, IFormWidgetMixin {
	get:IFormWidgetGet;
	set:IFormWidgetSet;
}

export interface IFormWidgetGet extends dijit.IWidgetGet, IFormWidgetMixinGet {
	(name:'readOnly'):boolean;
}

export interface IFormWidgetSet extends dijit.IWidgetSet, IFormWidgetMixinSet {
	(name:'readOnly', value:boolean);
}

export interface IFormValueMixin extends IFormWidgetMixin {
	get:IFormValueMixinGet;
	set:IFormValueMixinSet;
}

export interface IFormValueMixinGet extends IFormWidgetMixinGet {
	(name:'readOnly'):boolean;
}

export interface IFormValueMixinSet extends IFormWidgetMixinSet {
	(name:'readOnly', value:boolean):void;
}

export interface IFormWidgetMixin extends dijit.IMixin {
	get:IFormWidgetMixinGet;
	set:IFormWidgetMixinSet;
}

export interface IFormWidgetMixinGet extends dijit.IMixinGet {
	(name:'alt'):string;
	(name:'aria-label'):string;
	(name:'disabled'):boolean;
	(name:'intermediateChanges'):boolean;
	(name:'name'):string;
	(name:'scrollOnFocus'):boolean;
	(name:'type'):string;
	(name:'tabIndex'):string;
	(name:'value'):string;
}

export interface IFormWidgetMixinSet extends dijit.IMixinSet {
	(name:'alt', value:string):void;
	(name:'aria-label', value:string):void;
	(name:'disabled', value:boolean):void;
	(name:'intermediateChanges', value:boolean):void;
	(name:'name', value:string):void;
	(name:'scrollOnFocus', value:boolean):void;
	(name:'type', value:string):void;
	(name:'tabIndex', value:string):void;
	(name:'value', value:string):void;
}

export interface IRadioButton extends ICheckBox {
	get:IRadioButtonGet;
	set:IRadioButtonSet;
}

export interface IRadioButtonGet extends ICheckBoxGet {
}

export interface IRadioButtonSet extends ICheckBoxSet {
}

export interface ITextarea extends ITextBox {
	get:ITextareaGet;
	set:ITextareaSet;
}
export interface ITextareaGet extends ITextBoxGet {
	(name:'cols'):number;
	(name:'rows'):number;
}
export interface ITextareaSet extends ITextBoxSet {
	(name:'cols', value:number):void;
	(name:'rows', value:number):void;
}

export interface ITextBox extends IFormValueWidget, ITextBoxMixin {
	get:ITextBoxGet;
	set:ITextBoxSet;
}
export interface ITextBoxGet extends IFormValueWidgetGet, ITextBoxMixinGet {
}
export interface ITextBoxSet extends IFormValueWidgetSet, ITextBoxMixinSet {
}

export interface ITextBoxMixin extends dijit.IMixin {
	get:ITextBoxMixinGet;
	set:ITextBoxMixinSet;
}

export interface ITextBoxMixinGet extends dijit.IMixinGet {
	(name:'lowercase'):boolean;
	(name:'maxLength'):string;
	(name:'onInput'):Function;
	(name:'placeHolder'):string;
	(name:'propercase'):boolean;
	(name:'selectOnClick'):boolean;
	(name:'trim'):boolean;
	(name:'uppercase'):boolean;
}

export interface ITextBoxMixinSet extends dijit.IMixinSet {
	(name:'lowercase', value:boolean):void;
	(name:'maxLength', value:string):void;
	(name:'onInput', value:Function):void;
	(name:'placeHolder', value:string):void;
	(name:'propercase', value:boolean):void;
	(name:'selectOnClick', value:boolean):void;
	(name:'trim', value:boolean):void;
	(name:'uppercase', value:boolean):void;
}

export interface IToggleButton extends IButton {
	get:IToggleButtonGet;
	set:IToggleButtonSet;
}

export interface IToggleButtonGet extends IButtonGet {
	(name:'checked'):boolean;
}

export interface IToggleButtonSet extends IButtonSet {
	(name:'checked', value:boolean):void;
}
