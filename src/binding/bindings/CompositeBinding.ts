import arrayUtil = require('dojo/_base/array');
import binding = require('../interfaces');
import Binding = require('../Binding');
import util = require('../../util');

interface Part {
	destroy?():void;
	get():string;
}

/**
 * The CompositeBinding class enables source-only bindings composed of multiple data-binding sources plus static
 * strings.
 *
 * @example
 * Creating a composite data binding from multiple objects:
 *
 * ```ts
 * var binding:CompositeBinding = new CompositeBinding({
 *   object: user,
 *   path: [
 *     'Hello',
 *     { path: 'name' },
 *     '! You have ',
 *     { object: user.getUpdates(), path: 'messages.length' },
 *     ' messages.'
 *   ],
 *   binder: binder
 * });
 * ```
 */
class CompositeBinding extends Binding<string> {
	static test(kwArgs:binding.IBindingArguments):boolean {
		// TODO: Make path generic instead of string?
		// TODO: Add hinting for source/target?
		return util.isObject(kwArgs.object) && (<any> kwArgs.path) instanceof Array;
	}

	/**
	 * The decomposed parts of the source binding.
	 */
	private _parts:Part[];

	constructor(kwArgs:binding.IBindingArguments) {
		super(kwArgs);

		var parts:Part[] = this._parts = [];

		var self = this;
		arrayUtil.forEach(<any> kwArgs.path, function (path:any):void {
			if (path.path) {
				var binding:binding.IBinding<string> = kwArgs.binder.createBinding<string>(path.object || kwArgs.object, path.path, { useScheduler: false });
				binding.observe(function ():void {
					self.notify({ value: self.get() });
				});
				parts.push(binding);
			}
			else {
				parts.push({
					get: function ():string {
						return path;
					}
				});
			}
		});
	}

	destroy():void {
		super.destroy();

		var part:Part;
		while ((part = this._parts.pop())) {
			part.destroy && part.destroy();
		}

		this._parts = null;
	}

	get():string {
		var result:string[] = [];
		for (var i = 0, part:Part; (part = this._parts[i]); ++i) {
			result.push(part.get());
		}

		return result.join('');
	}
}

export = CompositeBinding;
