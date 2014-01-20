import binding = require('../../../binding/interfaces');
import BindingProxty = require('../../../binding/BindingProxty');
import core = require('../../../interfaces');

class MockProxty<SourceT, TargetT> extends BindingProxty<SourceT, TargetT> implements binding.IProxty<SourceT, TargetT> {
	static test(kwArgs:binding.IProxtyArguments):boolean {
		return true;
	}

	destroyed:boolean = false;
	kwArgs:binding.IProxtyArguments;
	target:core.IProxty<TargetT>;
	value:SourceT;

	constructor(kwArgs:binding.IProxtyArguments) {
		super(kwArgs);
		this.kwArgs = kwArgs;
		this.kwArgs.object && (this.kwArgs.object['mockProxty'] = this);
	}

	bindTo(target:core.IProxty<TargetT>):IHandle {
		this.target = target;

		if (!target) {
			return;
		}

		target.set(<TargetT> <any> this.value);

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

	emulateUpdate(value:SourceT):void {
		this.value = value;
		this.target && this.target.set(<TargetT> <any> value);
	}

	get():SourceT {
		return this.value;
	}

	set(value:SourceT):void {
		this.value = value;
	}
}

export = MockProxty;
