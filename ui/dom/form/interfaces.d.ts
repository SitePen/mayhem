/// <reference path="../../../dojo" />

export interface IButton extends IControl {
	_label:string;
	_type:string;
}

export interface ICheckbox extends IToggleButton {
	_indeterminate:boolean;
}

export interface IControl {
	_disabled:boolean;
	_name:string;
	_tabIndex:number; // _tabindex
}

export interface ITextarea extends ITextbox {
	_cols:number;
	_rows:number;
}

export interface ITextbox extends IControl {
	_maxLength:number; // _maxlength:number
	_placeHolder:string; // _placeholder
	_trim:boolean;
	_value:string;
}

export interface IToggleButton extends IButton {
	_checked:boolean;
}
