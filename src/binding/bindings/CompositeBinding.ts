import * as binding from '../interfaces';
import Binding from '../Binding';
import { isObject } from '../../util';

interface Part {
	destroy?(): void;
	get(): string;
}

// TODO: Move into templating system
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
	static test(kwArgs: binding.IBindingArguments): boolean {
		// TODO: Make path generic instead of string?
		// TODO: Add hinting for source/target?
		return isObject(kwArgs.object) && (<any> kwArgs.path) instanceof Array;
	}

	/**
	 * The decomposed parts of the source binding.
	 */
	private _parts: Part[];

	constructor(kwArgs: binding.IBindingArguments) {
		super(kwArgs);

		var parts: Part[] = this._parts = [];

		var self = this;
		(<Array<string | { object?: {}; path: string; }>> <any> kwArgs.path).forEach(function (path) {
			if (typeof path === 'string') {
				parts.push({
					get: function () {
						return path;
					}
				});
			}
			else {
				var binding = kwArgs.binder.createBinding<string>(path.object || kwArgs.object, path.path, { useScheduler: false });
				binding.observe(function () {
					self.notify({ value: self.get() });
				});
				parts.push(binding);
			}
		});
	}

	destroy(): void {
		super.destroy();

		var part: Part;
		while ((part = this._parts.pop())) {
			part.destroy && part.destroy();
		}

		this._parts = null;
	}

	get(): string {
		var result: string[] = [];
		var parts = this._parts;
		for (var i = 0, part: Part; (part = parts[i]); ++i) {
			result.push(part.get());
		}

		return result.join('');
	}
}

export default CompositeBinding;
