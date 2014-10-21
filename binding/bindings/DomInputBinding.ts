/// <reference path="../../dojo" />

import binding = require('../interfaces');
import Binding = require('../Binding');
import has = require('../../has');
import on = require('dojo/on');

/**
 * This class is only needed by Chrome until webidl-bad-descriptors is fixed.
 */
class DomInputBinding extends Binding<string> {
	static test(kwArgs:binding.IBindingArguments):boolean {
		var object = <HTMLInputElement> kwArgs.object;
		return has('webidl-bad-descriptors') && object != null && kwArgs.path === 'value' && 'oninput' in object;
	}

	/**
	 * The watch handle for the bound object.
	 */
	private _handle:IHandle;

	/**
	 * The object containing the final property to be bound.
	 */
	private _object:HTMLInputElement;

	constructor(kwArgs:binding.IBindingArguments) {
		super(kwArgs);

		var object = this._object = <HTMLInputElement> kwArgs.object;

		var self = this;
		this._handle = on(object, 'input', function (event:Event):void {
			self.notify({ value: (<HTMLInputElement> event.target).value });
		});
	}

	destroy():void {
		super.destroy();
		this._handle.remove();
		this._handle = this._object = null;
	}

	get():string {
		return this._object ? this._object.value : undefined;
	}

	set(value:string):void {
		this._object && (this._object.value = value);
	}
}

export = DomInputBinding;
