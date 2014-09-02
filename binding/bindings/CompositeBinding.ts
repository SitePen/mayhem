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
class CompositeBinding extends Binding<any, string> implements binding.IBinding<any, string> {
	static test(kwArgs:binding.IBindingArguments):boolean {
		// TODO: Make path generic instead of string?
		// TODO: Add hinting for source/target?
		return util.isObject(kwArgs.object) && (<any> kwArgs.path) instanceof Array;
	}

	/**
	 * The decomposed parts of the source binding.
	 */
	private _parts:Part[];

	/**
	 * The target binding.
	 */
	private _target:binding.IBinding<string, any>;

	constructor(kwArgs:binding.IBindingArguments) {
		super(kwArgs);

		var parts:Part[] = this._parts = [];

		var self = this;
		arrayUtil.forEach(<any> kwArgs.path, function (path:any):void {
			if (path.path) {
				var binding:binding.IBinding<any, string> = kwArgs.binder.createBinding(path.object || kwArgs.object, path.path, { scheduled: false });
				binding.bindTo(<any> {
					set: function ():void {
						self._target && self._target.set(self.get());
					}
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

	bindTo(target:binding.IBinding<string, any>, options:binding.IBindToOptions = {}):IHandle {
		this._target = target;

		if (!target) {
			return;
		}

		if (options.setValue !== false) {
			target.set(this.get());
		}

		var self = this;
		return {
			remove: function ():void {
				this.remove = function ():void {};
				self = self._target = null;
			}
		};
	}

	destroy():void {
		this.destroy = function ():void {};

		var part:Part;
		while ((part = this._parts.pop())) {
			part.destroy && part.destroy();
		}

		this._target = this._parts = null;
	}

	get():string {
		var result:string[] = [];
		for (var i = 0, part:Part; (part = this._parts[i]); ++i) {
			result.push(part.get());
		}

		return result.join('');
	}

	set(value:string):void {
		throw new Error('CompositeBinding is a source-only binding');
	}
}

export = CompositeBinding;
