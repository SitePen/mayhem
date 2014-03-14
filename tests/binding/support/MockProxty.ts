import binding = require('../../../binding/interfaces');
import BindingProxty = require('../../../binding/BindingProxty');
import core = require('../../../interfaces');

class MockProxty<T> extends BindingProxty<T, T> implements binding.IProxty<T, T> {
	static test(kwArgs:binding.IProxtyArguments):boolean {
		return true;
	}

	destroyed:boolean = false;
	kwArgs:binding.IProxtyArguments;
	target:core.IProxty<T>;
	value:T;

	constructor(kwArgs:binding.IProxtyArguments) {
		super(kwArgs);
		this.kwArgs = kwArgs;
		this.kwArgs.object && (this.kwArgs.object['mockProxty'] = this);
	}

	bindTo(target:core.IProxty<T>, options:binding.IBindToOptions = {}):IHandle {
		this.target = target;

		if (!target) {
			return;
		}

		if (options.setValue !== false) {
			target.set(<T> <any> this.value);
		}

		var self = this;
		return {
			remove: function () {
				this.remove = function () {};
				self = self.target = null;
			}
		};
	}

	destroy():void {
		this.destroy = function () {};
		this.destroyed = true;
		this.kwArgs.object && (this.kwArgs.object['mockProxty'] = undefined);
		this.kwArgs = this.value = this.target = null;
	}

	emulateUpdate(value:T):void {
		this.value = value;
		this.target && this.target.set(<T> <any> value);
	}

	get():T {
		return this.value;
	}

	set(value:T):void {
		this.value = value;
	}
}

export = MockProxty;
