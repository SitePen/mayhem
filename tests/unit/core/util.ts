/// <reference path="../../intern" />

import assert = require('intern/chai!assert');
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

registerSuite({
	name: 'mayhem/util',

	'.createHandle'() {
		var count = 0;
		var handle = util.createHandle(function ():void {
			count++;
		});

		handle.remove();
		assert.strictEqual(count, 1);

		// Remove should be a no-op on subsequent calls
		handle.remove();
		assert.strictEqual(count, 1);
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
		assert.strictEqual(count, 2);
	},

	'.createTimer': {
		'timer'() {
			var dfd = this.async(50);

			util.createTimer(function ():void {
				dfd.resolve();
			});
		},

		// TODO: is this a good thing to test? is this a good way to test it?
		// Is it safe to assume the timers will run in the desired order, or could varying browser/platform clock
		// resolution invalidate this test?
		'cancel timer'() {
			var dfd = this.async(50);
			var handle = util.createTimer(function ():void {
				dfd.reject(new Error('timer should be canceled'))
			}, 20);

			util.createTimer(function ():void {
				handle.remove();
			});

			util.createTimer(function (): void {
				dfd.resolve();
			}, 25);
		}
	},

	'.debounce': {
		'function execution is delayed'() {
			var dfd = this.async(50);
			var delay = 20;
			var lastTick:number;

			var debouncedFunction = util.debounce(function ():void {
				if (((new Date()).getTime() - lastTick) < delay) {
					dfd.reject(new Error('debounced function should not run too soon'));
				}

				dfd.resolve();
			}, delay);

			lastTick = (new Date()).getTime();
			debouncedFunction();
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

				method2():void {
					// no-op
				}
			};

			util.deferMethods(obj, [ 'method1' ], 'method2');
			obj.method1();
			assert.strictEqual(count, 0, 'method1 should not be called');
			obj.method2();
			assert.strictEqual(count, 1, 'method1 should be called');
		},

		'with instead argument'() {
			var count = 0;
			var obj = {
				method1(increment:number = 1):void {
					count += increment;
				},

				method2():void {
					// no-op
				}
			};

			util.deferMethods(obj, [ 'method1' ], 'method2', function () {
				return [ 2 ];
			});

			obj.method1();
			assert.strictEqual(count, 0, 'method1 should not be called');
			obj.method2();
			assert.strictEqual(count, 2, 'method1 should be called with instead arguments');
		},

		'multiple deferred methods'() {
			var message = '';
			var obj = {
				addA():void {
					message += 'A';
				},

				addB():void {
					message += 'B';
				},

				end():void {
					// no-op
				}
			};

			util.deferMethods(obj, [ 'addA', 'addB' ], 'end');

			obj.addA();
			obj.addB();
			assert.strictEqual(message, '', 'deferred methods should not be called');
			obj.end();
			assert.strictEqual(message, 'AB', 'deferred methods should be called in order');
		}
	},

	'.deferSetters': {
		simple() {
			var obj = new ObservableA();

			util.deferSetters(obj, [ 'foo', 'bar' ], 'end');

			obj.set('foo', 'foo');
			assert.strictEqual(obj.get('foo'), undefined, 'foo setter should be deferred');
			obj.set('bar', 'bar');
			assert.strictEqual(obj.get('bar'), undefined, 'bar setter should be deferred');

			obj.end();

			assert.strictEqual(obj.get('foo'), 'foo', 'foo setter should be called');
			assert.strictEqual(obj.get('bar'), 'bar', 'bar setter should be called');
		},

		'with instead argument'() {
			var obj = new ObservableA();

			util.deferSetters(obj, [ 'foo', 'bar' ], 'end', function (setterName, value) {
				return [ value.toUpperCase() ];
			});

			obj.set('foo', 'foo');
			assert.strictEqual(obj.get('foo'), undefined, 'foo setter should be deferred');
			obj.set('bar', 'bar');
			assert.strictEqual(obj.get('bar'), undefined, 'bar setter should be deferred');

			obj.end();

			assert.strictEqual(obj.get('foo'), 'FOO', 'foo setter should be called');
			assert.strictEqual(obj.get('bar'), 'BAR', 'bar setter should be called');
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

		// TODO: is this the desired behavior?
		// two backslashes are reduced to one; 3+ are reduced to two
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

	'.isEqual'() {
		var obj = {};
		var objRef = obj;

		assert.isTrue(util.isEqual('', ''));
		assert.isTrue(util.isEqual('a', 'a'));
		assert.isFalse(util.isEqual('a', 'b'));
		assert.isTrue(util.isEqual(5, 5));
		assert.isFalse(util.isEqual(5, 1));
		assert.isTrue(util.isEqual(obj, objRef));
		assert.isTrue(util.isEqual((5 + undefined), (10 - undefined)));
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
		assert.lengthOf(array, 2);

		assert.isFalse(util.spliceMatch(array, 2));
		assert.lengthOf(array, 2);

		assert.isTrue(util.spliceMatch(array, 1));
		assert.lengthOf(array, 1);

		assert.isTrue(util.spliceMatch(array, 3));
		assert.lengthOf(array, 0);

		array = [ 'a', 2, 'c' ];

		assert.isTrue(util.spliceMatch(array, 2));
		assert.lengthOf(array, 2);

		assert.isFalse(util.spliceMatch(array, 2));
		assert.lengthOf(array, 2);

		assert.isTrue(util.spliceMatch(array, 'a'));
		assert.lengthOf(array, 1);

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
				new Promise(function (resolve) {
					setTimeout(function () {
						resolve(1);
					}, 3);
				}),
				new Promise(function (resolve) {
					setTimeout(function () {
						resolve(2);
					}, 1);
				}),
				new Promise(function (resolve) {
					setTimeout(function () {
						resolve(3);
					}, 2);
				}),
			], dfd.callback(function (a:number, b:number, c:number) {
				assert.deepEqual([ a, b, c ], [ 1, 2, 3 ]);
			}));
		},

		rejected() {
			var dfd = this.async(100);

			util.spread([
				new Promise(function (resolve) {
					setTimeout(function () {
						resolve(1);
					}, 1)
				}),
				new Promise(function (resolve, reject) {
					setTimeout(function () {
						reject(new Error('rejected'));
					}, 5);
				})
			], function () {
				dfd.reject(new Error('deferred should not be resolved'));
			}, dfd.callback(function (error:Error) {
				assert.strictEqual(error.message, 'rejected');
			}));
		}
	}
});
