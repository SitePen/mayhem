/// <reference path="../../intern" />

import assert = require('intern/chai!assert');
import Binder = require('../../../binding/Binder');
import Binding = require('../../../binding/Binding');
//import bindingInterface = require('../../../../binding/interfaces');
//import declare = require('dojo/_base/declare');
import registerSuite = require('intern!object');


// TODO: should this just extend Binding?
class MockPropertyBinder implements bindingInterface.IBindingConstructor {
	constructor(kwArgs:bindingInterface.IBindingArguments):bindingInterface.IBinding {

	}
	get() {},

	set() {},

	test(kwArgs:bindingInterface.IBindingArguments):boolean {

	}
}

registerSuite({
	name: 'mayhem/binding/Binder',

	'.test'() {
		var binder = new Binder({
			constructors: [
				{
					get() {},

				}
			]
		});
	}
});
