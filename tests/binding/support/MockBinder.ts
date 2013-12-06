import binding = require('../../../binding/interfaces');
import Property = require('../../../binding/properties/Property');

class MockBinder extends Property implements binding.IBoundProperty {
	static test(kwArgs:binding.IPropertyBinderArguments):boolean {
		return true;
	}

	kwArgs:binding.IPropertyBinderArguments;
	value:any;
	target:binding.IBoundProperty;
	destroyed:boolean = false;

	constructor(kwArgs:binding.IPropertyBinderArguments) {
		super(kwArgs);
		this.kwArgs = kwArgs;
		this.kwArgs.object && (this.kwArgs.object['mockBinder'] = this);
	}

	get():any {
		return this.value;
	}

	emulateUpdate(value:any):void {
		this.value = value;
		this.target && this.target.set(value);
	}

	set(value:any):void {
		this.value = value;
	}

	bindTo(target:binding.IBoundProperty):IHandle {
		this.target = target;

		if (!target) {
			return;
		}

		target.set(this.value);

		var self = this;
		return {
			remove: function () {
				this.remove = function () {};
				self.target = null;
			}
		};
	}

	destroy():void {
		this.destroy = function () {};
		this.destroyed = true;
		this.kwArgs.object && (this.kwArgs.object['mockBinder'] = undefined);
		this.kwArgs = this.value = this.target = null;
	}
}

export = MockBinder;
