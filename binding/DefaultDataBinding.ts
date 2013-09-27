/// <reference path="interfaces.ts" />
/// <amd-reference path="dbind.d.js" />

import dbind = require('dbind');

class DefaultDataBinding implements IDataBinding {
	test(kwArgs:IDataBindingArguments) {
		return /[a-zA-Z0-9_$]/.test(kwArgs.binding);
	}

	bind(kwArgs:IDataBindingArguments):IDataBindingHandle {
		var to = kwArgs.to,
			binding = dbind(kwArgs.from, kwArgs.property).to(to, kwArgs.binding);

		return {
			get to() {
				return to;
			},
			set to(value:Object) {
				to = value;
				binding.remove();
				binding.to(to, kwArgs.binding);
			},

			remove: function () {
				binding.remove();
				binding = to = null;
			},

			notify: function (value:any) {
				binding.put(value);
			}
		};
	}
}
