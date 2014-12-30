import bindingInterface = require('../../binding/interfaces');

class MockBinder {
	constructor(kwArgs:bindingInterface.IBindingArguments) {
		this.kwArgs = kwArgs;
	}

	kwArgs:any;

	get() {}

	set() {}

	static test(kwArgs:bindingInterface.IBindingArguments):boolean {
		return (<any> kwArgs.object).test;
	}
}

export = MockBinder;
