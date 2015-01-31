import assert = require('intern/chai!assert');
import has = require('../../../has');
import lang = require('dojo/_base/lang');
import Observable = require('../../../Observable');
import Promise = require('../../../Promise');
import util = require('../../../util');
import registerSuite = require('intern!object');

class ObservableA extends Observable {
	private _foo:string;
	private _bar:string;

	_fooGetter():string {
		return this._foo;
	}

	_fooSetter(value:string):void {
		this._foo = value;
	}

	_barGetter():string {
		return this._bar;
	}

	_barSetter(value:string):void {
		this._bar = value;
	}

	end():void {
		// no-op
	}
}

class SimpleObject {
	g:number;
}

class NestedObject {
	e:number;
	f:SimpleObject;
	h:any;
}

class MixedObject {
	a:any;
	b:any;
	c:Object;
	d:NestedObject;
	i:string[];
}

registerSuite({
	name: 'mayhem/util',

	'.createHandle'() {
		var count = 0;
		var handle = util.createHandle(function ():void {
			count++;
		});

		handle.remove();
		assert.strictEqual(count, 1);

		handle.remove();
		assert.strictEqual(count, 1, 'remove should be a no-op on subsequent calls');
	},

	'.createCompositeHandle'() {
		var count = 0;
		function destructor():void {
			count++;
		}
		var handle = util.createCompositeHandle(
			util.createHandle(destructor),
			util.createHandle(destructor)
		);

		handle.remove();
		assert.strictEqual(count, 2, 'both destructors in the composite handle should have been called');
	},

	'.createTimer': {
		'timer'() {
			var dfd = this.async(50);

			util.createTimer(function ():void {
				dfd.resolve();
			});
		},

		'cancel timer'() {
			var dfd = this.async(50);
			var handle = util.createTimer(function ():void {
				dfd.reject(new Error('timer should be canceled'))
			}, 0);

			handle.remove();

			setTimeout(function ():void {
				dfd.resolve();
			}, 0)
		}
	},

	'.debounce': {
		'function execution is delayed'() {
			var dfd = this.async(50);
			var delay = 10;
			var count = 0;
			var lastTick:number;

			var debouncedFunction = util.debounce(function ():void {
				count++;

				if (((new Date()).getTime() - lastTick) < delay) {
					dfd.reject(new Error('debounced function should not run too soon'));
				}
			}, delay);

			lastTick = (new Date()).getTime();

			debouncedFunction();
			debouncedFunction();
			debouncedFunction();
			debouncedFunction();

			assert.strictEqual(count, 0, 'debounced function should not have run yet');

			setTimeout(dfd.callback(function () {
				assert.strictEqual(count, 1, 'debounced function should only run once');
			}), 20);
		},

		'method runs in context'() {
			var dfd = this.async(50);
			var context = {
				method: util.debounce(function ():void {
					assert.strictEqual(this, context, 'Context should be preserved');
					dfd.resolve();
				})
			};

			context.method();
		}
	},

	'.deferMethods': {
		simple() {
			var count = 0;
			var obj = {
				method1():void {
					count++;
				},

				noop():void {}
			};

			util.deferMethods(obj, [ 'method1' ], 'noop');
			obj.method1();
			assert.strictEqual(count, 0, 'method1 should not be called until after the target method is called');
			obj.noop();
			assert.strictEqual(count, 1, 'method1 should have been called after the target method was called');
		},

		'with instead argument'() {
			var count = 0;
			var obj = {
				method1(increment:number = 1):void {
					count += increment;
				},

				noop():void {}
			};

			util.deferMethods(obj, [ 'method1' ], 'noop', function () {
				return [ 2 ];
			});

			obj.method1();
			assert.strictEqual(count, 0, 'method1 should not be called until after the target method is called');
			obj.noop();
			assert.strictEqual(count, 2, 'method1 should have been called with instead arguments');
		},

		'multiple deferred methods'() {
			var count = 0;
			var obj = {
				addA():void {
					count++;
				},

				addB():void {
					count++;
				},

				noop():void {}
			};

			util.deferMethods(obj, [ 'addA', 'addB' ], 'noop');

			obj.addA();
			obj.addB();
			assert.strictEqual(count, 0,
					'deferred methods should not be called until after the target method is called');
			obj.noop();
			assert.strictEqual(count, 2, 'deferred methods should have been called after the target method was called');
		}
	},

	'.deferSetters': {
		simple() {
			var obj = new ObservableA();

			util.deferSetters(obj, [ 'foo', 'bar' ], 'end');

			obj.set('foo', 'foo');
			assert.strictEqual(obj.get('foo'), undefined,
				'foo setter not be called until after the target method is called');

			obj.set('bar', 'bar');
			assert.strictEqual(obj.get('bar'), undefined,
				'bar setter should not be called until after the target method is called');

			obj.end();

			assert.strictEqual(obj.get('foo'), 'foo',
				'foo setter should have been called after the target method was called');
			assert.strictEqual(obj.get('bar'), 'bar',
				'bar setter should have been called after the target method was called');
		},

		'with instead argument'() {
			var obj = new ObservableA();

			util.deferSetters(obj, [ 'foo', 'bar' ], 'end', function (setterName, value) {
				return [ value.toUpperCase() ];
			});

			obj.set('foo', 'foo');
			assert.strictEqual(obj.get('foo'), undefined,
				'foo setter not be called until after the target method is called');

			obj.set('bar', 'bar');
			assert.strictEqual(obj.get('bar'), undefined,
				'bar setter should not be called until after the target method is called');

			obj.end();

			assert.strictEqual(obj.get('foo'), 'FOO', 'foo setter should have been called with instead arguments');
			assert.strictEqual(obj.get('bar'), 'BAR', 'bar setter should have been called with instead arguments');
		}
	},

	'.escapedIndexOf'() {
		var index:number;

		index = util.escapedIndexOf('', '');
		assert.strictEqual(index, -1);

		index = util.escapedIndexOf('abc', '');
		assert.strictEqual(index, -1);

		index = util.escapedIndexOf('', 'FOO');
		assert.strictEqual(index, -1);

		index = util.escapedIndexOf('abc', 'FOO');
		assert.strictEqual(index, -1);

		index = util.escapedIndexOf('FOO', 'FOO', -1);
		assert.strictEqual(index, -1);

		index = util.escapedIndexOf('abcFOOxyz', 'FOO');
		assert.strictEqual(index, 3);

		index = util.escapedIndexOf('abc\\FOOmnoFOOxyz', 'FOO');
		assert.strictEqual(index, 10);

		index = util.escapedIndexOf('abc\\\\FOOxyz', 'FOO');
		assert.strictEqual(index, 5);

		index = util.escapedIndexOf('FOOFOO', 'FOO');
		assert.strictEqual(index, 0);

		index = util.escapedIndexOf('aFOO', 'FOO');
		assert.strictEqual(index, 1);

		index = util.escapedIndexOf('\\FOOFOO', 'FOO');
		assert.strictEqual(index, 4);

		index = util.escapedIndexOf('\\\\FOOFOO', 'FOO');
		assert.strictEqual(index, 2);

		index = util.escapedIndexOf('FOOFOOFOO', 'FOO', 4);
		assert.strictEqual(index, 6)

		index = util.escapedIndexOf('FOO\\FOOFOO', 'FOO', 4);
		assert.strictEqual(index, 7);

		index = util.escapedIndexOf('abcFOO\\\\FOO', 'FOO', 8);
		assert.strictEqual(index, 8);
	},

	'.escapedSplit'() {
		var result:string[];

		result = util.escapedSplit('', '');
		assert.deepEqual(result, [ '' ]);

		result = util.escapedSplit('abc', '');
		assert.deepEqual(result, [ 'abc' ]);

		result = util.escapedSplit('abc', '|');
		assert.deepEqual(result, [ 'abc' ]);

		result = util.escapedSplit('a|b|c', '|');
		assert.deepEqual(result, [ 'a', 'b', 'c' ]);

		result = util.escapedSplit('|a|b|c|', '|');
		assert.deepEqual(result, [ '', 'a', 'b', 'c', '' ]);

		result = util.escapedSplit('a|b\\|z|c', '|');
		assert.deepEqual(result, [ 'a', 'b|z', 'c' ]);

		result = util.escapedSplit('\\|a||b|c\\|', '|');
		assert.deepEqual(result, [ '|a', '', 'b', 'c|' ]);

		result = util.escapedSplit('a|\\b|\\\\c', '|');
		assert.deepEqual(result, [ 'a', '\\b', '\\c' ]);
	},

	'.escapeXml'() {
		var result:string;

		result = util.escapeXml('unchanged');
		assert.strictEqual(result, 'unchanged');

		result = util.escapeXml('abc&def<ghi>jkl\'m"n');
		assert.strictEqual(result, 'abc&amp;def&lt;ghi&gt;jkl&#39;m&quot;n');

		result = util.escapeXml('abc&def<ghi>jkl\'m"n', false);
		assert.strictEqual(result, 'abc&amp;def&lt;ghi>jkl\'m"n');
	},

	'.unescapeXml'() {
		var result:string;

		result = util.unescapeXml('unchanged');
		assert.strictEqual(result, 'unchanged');

		result = util.unescapeXml('abc&amp;&def;&lt;ghi&gt;jkl&#39;m&quot;n');
		assert.strictEqual(result, 'abc&&def;<ghi>jkl\'m"n')

		result = util.unescapeXml('abc&amp;de&#x201C;f&lt;ghi>jkl\'m"n');
		assert.strictEqual(result, 'abc&de“f<ghi>jkl\'m"n');
	},

	'.getModules'() {
		if (has('host-node')) {
			this.skip('require does not emit an error when loading a bad mid in Node.js');
		}

		// This test sometimes times out, so give it a long timeout value
		var dfd = this.async(30000);
		// TODO: require is broken and only throws an error on the first request for a mid that returns a 404
		// For now, ensure that you don't reuse invalid mids in tests
		var badModuleId = 'util1/bad/module/id';

		util.getModules([ badModuleId ]).then(function () {
			dfd.reject(new Error('Promise should not resolve'));
		}, dfd.callback(function (error:util.RequireError) {
			assert.include(error.message, badModuleId);
		}));
	},

	'.getObjectKeys'() {
		var objA = {
			key1: true,
			key2: false
		};
		var objB = lang.delegate(objA, {
			key3: true,
			key4: false
		});

		assert.sameMembers(util.getObjectKeys(objA), [ 'key1', 'key2' ]);
		assert.sameMembers(util.getObjectKeys(objB), [ 'key3', 'key4' ]);
	},

	'.isEqual'() {
		var obj = {};
		var objRef = obj;

		assert.isTrue(util.isEqual('', ''));
		assert.isTrue(util.isEqual('a', 'a'));
		assert.isFalse(util.isEqual('a', 'b'));
		assert.isTrue(util.isEqual(5, 5));
		assert.isFalse(util.isEqual(5, 1));
		assert.isTrue(util.isEqual(obj, objRef));
		assert.isTrue(util.isEqual(NaN, NaN));
	},

	'.isObject'() {
		assert.isFalse(util.isObject(undefined));
		assert.isTrue(util.isObject({}));
		assert.isFalse(util.isObject('a'));
		assert.isFalse(util.isObject(5));
		assert.isTrue(util.isObject([]));
	},

	'.spliceMatch'() {
		var array:any[] = [ 1, 2, 3 ];

		assert.isFalse(util.spliceMatch(array, ''));
		assert.isFalse(util.spliceMatch(array, 'a'));

		assert.isTrue(util.spliceMatch(array, 2));
		assert.deepEqual(array, [ 1, 3 ]);

		assert.isFalse(util.spliceMatch(array, 2));
		assert.deepEqual(array, [ 1, 3 ]);

		assert.isTrue(util.spliceMatch(array, 1));
		assert.deepEqual(array, [ 3 ]);

		assert.isTrue(util.spliceMatch(array, 3));
		assert.lengthOf(array, 0);

		array = [ 'a', 2, 'c' ];

		assert.isTrue(util.spliceMatch(array, 2));
		assert.deepEqual(array, [ 'a', 'c' ]);

		assert.isFalse(util.spliceMatch(array, 2));
		assert.deepEqual(array, [ 'a', 'c' ]);

		assert.isTrue(util.spliceMatch(array, 'a'));
		assert.deepEqual(array, [ 'c' ]);

		assert.isTrue(util.spliceMatch(array, 'c'));
		assert.lengthOf(array, 0);

		assert.isFalse(util.spliceMatch([], 1));
		assert.isFalse(util.spliceMatch([], ''));
		assert.isFalse(util.spliceMatch([], undefined));
	},

	'.spread': {
		resolved() {
			var dfd = this.async(100);

			util.spread([
				Promise.resolve(1),
				Promise.resolve(2),
				Promise.resolve(3)
			], dfd.callback(function (a:number, b:number, c:number) {
				assert.deepEqual([ a, b, c ], [ 1, 2, 3 ]);
			}));
		},

		rejected() {
			var dfd = this.async(100);

			util.spread([
				Promise.resolve(1),
				Promise.reject(new Error('rejected'))
			], function () {
				dfd.reject(new Error('deferred should not be resolved'));
			}, dfd.callback(function (error:Error) {
				assert.strictEqual(error.message, 'rejected');
			}));
		}
	},

	'.deepMixin': {
		'basic conditions and flat objects'() {
			var objA = {
				a: 1,
				b: 2
			};
			var objB = {
				c: 3,
				d: 4
			};
			var expectedA = {
				a: 1,
				b: 2
			};
			var expectedMix = {
				a: 1,
				b: 2,
				c: 3,
				d: 4
			};
			var objC:Object;

			util.deepMixin(objA, null);
			assert.deepEqual(objA, expectedA, 'mixing in null should have no effect');

			objC = util.deepMixin(objA, objB);
			assert.strictEqual(objC, objA, 'target should be returned');
			assert.deepEqual(objC, expectedMix);
		},

		'deep objects'() {
			var objA = {};
			var objB:MixedObject = {
				a: null,
				b: [],
				c: {},
				d: {
					e: 1,
					f: {
						g: 2
					},
					h: null
				},
				i: [ 'a', 'b', 'c' ]
			};

			util.deepMixin(objA, objB);
			assert.deepEqual(objA, objB);

			objA = {
				d: {
					e: 1,
					g: 3
				}
			};
			util.deepMixin(objA, objB);
			assert.notDeepEqual(objA, objB, 'objA should have extra properties not present on objB');
			assert.deepPropertyVal(objA, 'd.g', 3, 'objA should retain original data after mixin');
		}
	}
});
