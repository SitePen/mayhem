/// <reference path="./intern" />

import assert = require('intern/chai!assert');
import registerSuite = require('intern!object');
import util = require('../util');

registerSuite({
	name: 'util',

	'.applyMixins': function () {
		function Test () {}
		function Mixin1 () {}
		function Mixin2 () {}

		Mixin1.prototype.prop1 = 'mixin1Expected';
		Mixin2.prototype.prop2 = 'mixin2Expected';

		util.applyMixins(Test, [Mixin1, Mixin2]);

		assert.equal(Test.prototype.prop1, Mixin1.prototype.prop1);
		assert.equal(Test.prototype.prop2, Mixin2.prototype.prop2);
	
	},

	'.createSetter': function () {
		
		var expectedProperty:string, expectedValue:string;
		var propertyName = 'property';
		var childName = 'child';
		var childPropertyName = 'childProperty';
		var setter:any;
		var contextMissingChild = {
			_set: function (property:string, value:string) {
				expectedProperty = property;
				expectedValue = value;
			}
		};
		var contextWithChild = { _set: function() {}};

		setter = util.createSetter(propertyName, childName, childPropertyName);

		setter.call(contextMissingChild, 'testValue');
		
		assert.equal(expectedProperty, propertyName);
		assert.equal(expectedValue, 'testValue');

		expectedValue = undefined;
		expectedProperty = undefined;

		contextWithChild[childName] = {
			set: function(property:string, value:string) {
				expectedProperty = property;
				expectedValue = value;
			}
		};
		
		setter.call(contextWithChild, 'testValue');
		
		assert.equal(expectedProperty, childPropertyName, 'set childPropertyName when provided');
		assert.equal(expectedValue, 'testValue');
		
		expectedValue = undefined;
		expectedProperty = undefined;
		
		setter = util.createSetter(propertyName, childName);
		
		setter.call(contextWithChild, 'testValue');
		
		assert.equal(expectedProperty, propertyName, 'default to propertyName if no childPropertyName');
		assert.equal(expectedValue, 'testValue');

	},

	'.deferMethods': function () {
		var callList: string[] = [], setupArg:string, setContentArg:string;
		var test = {
			setup: function (arg:string) {
				setupArg = arg;
				callList.push('setup');
			},
			setContent: function (arg:string) {
				setContentArg = arg;
				callList.push('setContent');
			},
			render: function () {
				callList.push('render');
			}
		};

		util.deferMethods(test, ['setup', 'setContent'], 'render');

		test.setup('setup');
		test.setContent('setContent');
		test.render();

		assert.deepEqual(callList, ['render', 'setup', 'setContent']);
		assert.equal(setupArg, 'setup');
		assert.equal(setContentArg, 'setContent');
		
	},

	'.deferSetters': function () {
		
		var callList: string[] = [], actualModel:string, actualContent:string;
		var test = {
			_modelSetter: function (model:string) {
				actualModel = model;
				callList.push('_modelSetter');
			},
			_contentSetter: function (content:string) {
				actualContent = content;
				callList.push('_contentSetter');
			},
			render: function () {
				callList.push('render');
			}
		};

		util.deferSetters(test, ['model', 'content'], 'render');

		test._modelSetter('model');
		test._contentSetter('content');
		test.render();

		assert.deepEqual(callList, ['render', '_modelSetter', '_contentSetter']);
		assert.equal('model', actualModel);
		assert.equal('content', actualContent);
		
	},
	
	'.destroy': function () {
		var destroy = function () {this.called++;};
		var target1 = {destroy: destroy, called: 0};
		var target2 = {destroy: destroy, called: 0};
		var target3 = {destroy: destroy, called: 0};

		util.destroy(target1, target2, target3);

		assert.equal(target1.called, 1);
		assert.equal(target2.called, 1);
		assert.equal(target3.called, 1);

		util.destroy(target1, target2, target3);
		
		assert.equal(target1.called, 1);
		assert.equal(target2.called, 1);
		assert.equal(target3.called, 1);
	
	},
	
	'.remove': function () {
		var remove = function () {this.called++;};
		var target1 = {remove: remove, called: 0};
		var target2 = {remove: remove, called: 0};
		var target3 = {remove: remove, called: 0};

		util.remove(target1, target2, target3);

		assert.equal(target1.called, 1);
		assert.equal(target2.called, 1);
		assert.equal(target3.called, 1);

	},

	'.escapeXml': function () {
		var input = 'This is some test & other < "things" > \'& items\'';
		var expectedOutput1 = 'This is some test &amp; other &lt; "things" > \'&amp; items\'';
		var expectedOutput2 = 'This is some test &amp; other &lt; &quot;things&quot; &gt; &#39;&amp; items&#39;';

		assert.equal(util.escapeXml(input), expectedOutput1);
		assert.equal(util.escapeXml(input, true), expectedOutput2);
	
	},

	'.splitMatch': function ()  {
		var matchItem = 'findMe';
		var set1 = [1, 2, {}, matchItem, 0];
		var set2 = [1, 2, {}, 0];

		assert.isTrue(util.spliceMatch(set1, matchItem));
		assert.isFalse(util.spliceMatch(set2, matchItem));
	},

	'.deepMixin': function () {
		var targetObj = {
			a: 1,
			b: {
				b: 2
			},
			c: [{
				a: 1
			}, {
				b: 2
			}]
		};
		var sourceObj = {
			a: 2,
			b: {
				a: 1 
			},
			c: [{
				a: 2,
				b: 3
			}],
			d: 4
		};

		var expectedObj = {
			a: 2,
			b: {
				a: 1,
				b: 2
			},
			c: [{
				a: 2,
				b: 3
			}],
			d: 4
		};

		assert.deepEqual(util.deepMixin(targetObj, sourceObj), expectedObj);
	},

	'.getObjectKeys': function () {
		var expected = [ 'a', 'b', 'c' ],
			object:any = { a: 1, b: 2 };

		object.c = 3;

		assert.deepEqual(util.getObjectKeys(object), expected);
	},

	'.isEqual': function () {
		var object = {};
		assert.isTrue(util.isEqual(object, object));
		assert.isTrue(util.isEqual('a', 'a'));
		assert.isTrue(util.isEqual(NaN, NaN));
		assert.isFalse(util.isEqual({}, {}));
		assert.isFalse(util.isEqual('a', 'b'));
		assert.isFalse(util.isEqual('1', 1));
	},

	'.createTimer': function () {
		var dfd:IInternDeferred<void> = this.async(500, 3),
			startDate:number = +new Date(),
			wasCalled = false,
			timerHandle:any;

		util.createTimer(dfd.callback(function () {
			assert.closeTo(+new Date() - startDate, 0, 50, 'Timer with zero delay should fire as soon as possible');
		}), 0);

		util.createTimer(dfd.callback(function () {
			assert.closeTo(+new Date() - startDate, 50, 100, 'Timer with 50ms delay should fire around 50ms');
		}), 50);

		timerHandle = util.createTimer(function() {
			wasCalled = true;
		}, 100);

		setTimeout(function() {
			timerHandle.remove();
		}, 50);

		setTimeout(dfd.callback(function() {
			assert.isFalse(wasCalled);	
		}), 200)

	},

	'.debounce': function () {
		var dfd:IInternDeferred<void> = this.async(500),
			actual = 0,
			expected = 2 + 8;

		var debounced = util.debounce(dfd.rejectOnError(function (increment) {
			actual += increment;

			if (actual < 4) {
				debounced(4);
				debounced(8);
			}
			else {
				assert.strictEqual(actual, expected, 'Debounced function should be invoked only once per loop');
				dfd.resolve(null);
			}
		}));

		debounced(1);
		debounced(2);
	}
});
