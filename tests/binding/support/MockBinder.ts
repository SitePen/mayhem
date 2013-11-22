/// <reference path="../../../binding/interfaces.ts" />

import Property = require('../../../binding/properties/Property');

class MockBinder extends Property implements IBoundProperty {
	static test(kwArgs:IPropertyBinderTestArguments):boolean {
		return true;
	}

	kwArgs:IPropertyBinderArguments;
	value:any;
	target:IBoundProperty;
	destroyed:boolean = false;

	constructor(kwArgs:IPropertyBinderArguments) {
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

	bindTo(target:IBoundProperty):IHandle {
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
