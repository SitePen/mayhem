/// <reference path="interfaces.ts" />

import BindingError = require('./BindingError');
import DataBindingDirection = require('./DataBindingDirection');

class Es3DataBindingRegistry implements IDataBindingRegistry {
	private _binders:IDataBinder[] = [];

	add(binder:IDataBinder, index?:number):IHandle {
		if (index == null) {
			index = Infinity;
		}

		var binders = this._binders;

		binders.splice(index, 0, binder);

		return {
			remove: function () {
				for (var i = 0, otherBinder; (otherBinder = binders[i]); ++i) {
					if (binder === otherBinder) {
						binders.splice(i, 1);
						break;
					}
				}

				binder = binders = null;
				this.remove = function () {};
			}
		};
	}

	test(kwArgs:IDataBindingArguments):boolean {
		for (var i = 0, binder; (binder = this._binders[i]); ++i) {
			if (binder.test(kwArgs)) {
				return true;
			}
		}

		return false;
	}

	bind(kwArgs:IDataBindingArguments):IDataBindingHandle {
		var handle;
		for (var i = 0, binder; (binder = this._binders[i]); ++i) {
			if (binder.test(kwArgs)) {
				handle = binder.bind(kwArgs);
				break;
			}
		}

		if (!handle) {
			throw new BindingError('No registered data binders understand the requested binding', kwArgs);
		}

		// TODO: This keeps the binders from having to do this themselves, but feels wrong and seems like it could
		// easily lead to a recursion problem.
		if (kwArgs.direction === DataBindingDirection.TWO_WAY) {
			var handle2 = this.bind({
				source: kwArgs.target,
				sourceBinding: kwArgs.targetBinding,
				target: kwArgs.source,
				targetBinding: kwArgs.sourceBinding
			});

			return {
				remove: function () {
					handle.remove();
					handle2.remove();
					handle = handle2 = null;
				}
			};
		}
		else {
			return handle;
		}
	}
}

export = Es3DataBindingRegistry;
