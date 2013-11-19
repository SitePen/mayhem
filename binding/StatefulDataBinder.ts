/// <reference path="interfaces.ts" />
/// <reference path="../interfaces.ts" />
/// <reference path="../dojo.d.ts" />

import lang = require('dojo/_base/lang');
import array = require('dojo/_base/array');
import has = require('dojo/has');

class StatefulDataBinder implements IDataBinder {
	test(kwArgs:IDataBindingArguments):boolean {
		return array.every([ 'source', 'target' ], function (objectType) {
			var object = kwArgs[objectType];
			return 'watch' in object && 'get' in object && 'set' in object;
		});
	}

	bind(kwArgs:IDataBindingArguments):IDataBindingHandle {
		var sourceProperty = new Property(<IStateful> kwArgs.source, kwArgs.sourceBinding),
			targetProperty = new Property(<IStateful> kwArgs.target, kwArgs.targetBinding),
			handle = sourceProperty.bindTo(targetProperty);

		return {
			remove: function () {
				this.remove = function () {};
				handle.remove();
				sourceProperty.destroy();
				targetProperty.destroy();
				handle = sourceProperty = targetProperty = null;
			}
		};
	}
}

export = StatefulDataBinder;
