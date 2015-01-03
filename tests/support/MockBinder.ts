import bindingInterface = require('../../binding/interfaces');

class MockBinder {
	_observers:any[];

	constructor(kwArgs:bindingInterface.IBindingArguments) {
		this.kwArgs = kwArgs;
		this._observers = [];
	}

	kwArgs:any;

	get() {}
	set() {}
	observe () {}
	notify () {}
	destroy () {}

	static test(kwArgs:bindingInterface.IBindingArguments):boolean {
		return (<any> kwArgs.object).test;
	}
}

export = MockBinder;
