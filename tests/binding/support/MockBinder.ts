import binding = require('../../../binding/interfaces');
import Property = require('../../../binding/properties/Property');

class MockBinder extends Property implements binding.IBoundProperty {
	static test(kwArgs:binding.IPropertyBinderArguments):boolean {
		return true;
	}

	destroyed:boolean = false;
	kwArgs:binding.IPropertyBinderArguments;
	target:binding.IBoundProperty;
	value:any;

	constructor(kwArgs:binding.IPropertyBinderArguments) {
		super(kwArgs);
		this.kwArgs = kwArgs;
		this.kwArgs.object && (this.kwArgs.object['mockBinder'] = this);
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

	emulateUpdate(value:any):void {
		this.value = value;
		this.target && this.target.set(value);
	}

	get():any {
		return this.value;
	}

	set(value:any):void {
		this.value = value;
	}
}

export = MockBinder;
