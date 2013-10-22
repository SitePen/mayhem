/// <reference path="interfaces.ts" />
/// <reference path="../dojo.d.ts" />

import lang = require('dojo/_base/lang');

var methodExpression:RegExp = /^(.*?)\((.*)\)$/;

class SimpleMethodDataBinder implements IDataBinder {
	private _methods:{ [name:string]: Function };

	test(kwArgs:IDataBindingArguments):boolean {
		var matches:string[];
		return Boolean((matches = methodExpression.exec(kwArgs.toBinding)) && this._methods[matches[1]]);
	}

	bind(kwArgs:IDataBindingArguments):IDataBindingHandle {
		var matches:string[] = methodExpression.exec(kwArgs.toBinding),
			fn = this._methods[matches[1]];

		kwArgs = lang.delegate(kwArgs, { toBinding: matches[2] });

		// TODO: How to chain?
		var a;
		return <IDataBindingHandle> a;
	}
}

export = SimpleMethodDataBinder;
