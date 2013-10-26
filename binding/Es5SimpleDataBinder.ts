/// <reference path="interfaces.ts" />
/// <reference path="../dojo.d.ts" />

import BindingError = require('./BindingError');
import lang = require('dojo/_base/lang');
import has = require('dojo/has');

class Es5SimpleDataBinder implements IDataBinder {
	test(kwArgs:IDataBindingArguments):boolean {
		return [ 'source', 'target' ].every(function (objectType) {
			var object = kwArgs[objectType],
				descriptor = Object.getOwnPropertyDescriptor(object, kwArgs[objectType + 'Binding']);

			return descriptor ? descriptor.configurable : Object.isExtensible(object);
		});
	}

	bind(kwArgs:IDataBindingArguments):IDataBindingHandle {
		var descriptor = Object.getOwnPropertyDescriptor(kwArgs.source, kwArgs.sourceBinding),
			newDescriptor:PropertyDescriptor = {
				enumerable: descriptor ? descriptor.enumerable : true,
				configurable: descriptor ? descriptor.configurable : true
			};

		if (descriptor && !('value' in descriptor)) {
			newDescriptor.get = descriptor.get;

			if (!descriptor.set) {
				throw new BindingError('Cannot bind to a read-only property', kwArgs);
			}
			else {
				newDescriptor.set = function (newValue) {
					descriptor.set.apply(this, arguments);
					kwArgs.target[kwArgs.targetBinding] = descriptor.get ? descriptor.get.call(this) : newValue;
				};
			}
		}
		else {
			var value = kwArgs.source[kwArgs.sourceBinding];
			newDescriptor.get = function () {
				return value;
			};
			newDescriptor.set = function (newValue) {
				kwArgs.target[kwArgs.targetBinding] = value = newValue;
			};
		}

		var value = kwArgs.source[kwArgs.sourceBinding];
		Object.defineProperty(kwArgs.source, kwArgs.sourceBinding, newDescriptor);
		kwArgs.target[kwArgs.targetBinding] = value;

		return {
			remove: function () {
				this.remove = function () {};
				Object.defineProperty(kwArgs.source, kwArgs.sourceBinding, descriptor);
				descriptor = kwArgs = null;
			}
		};
	}
}

export = Es5SimpleDataBinder;
