import assert = require('intern/chai!assert');
import has = require('../../../has');
import registerSuite = require('intern!object');
import MayhemWeakMap = require('../../../WeakMap');

registerSuite({
	name: 'mayhem/WeakMap',

	constructor() {
		if (!has('es6-weak-map')) {
			this.skip('test is only for environment with native WeakMap support');
		}

		assert.strictEqual(MayhemWeakMap, WeakMap, 'native WeakMap should be used')
	},

	'#set/#get/#has'() {
		if (!has('es6-weak-map') && !has('host-browser')) {
			this.skip('WeakMap shim only works in browser');
		}

		var key = document.body;
		var weakMap = new MayhemWeakMap();

		weakMap.set(key, 'test');
		assert.isTrue(weakMap.has(key), 'weakMap should contain key that was set');
		assert.strictEqual(weakMap.get(key), 'test', 'set value should be gettable');
	},

	'#delete'() {
		if (!has('es6-weak-map') && !has('host-browser')) {
			this.skip('WeakMap shim only works in browser');
		}

		var key = document.body;
		var weakMap = new MayhemWeakMap();
		weakMap.set(key, 'test');
		weakMap['delete'](key); // for IE8 compat
		assert.isFalse(weakMap.has(key), 'weakMap should no longer contain deleted key');
		assert.isUndefined(weakMap.get(key), 'weakmMap should no longer contain value for deleted key');
	},

	'#clear'() {
		if (!has('es6-weak-map') && !has('host-browser')) {
			this.skip('WeakMap shim only works in browser');
		}

		var key = document.body;
		var weakMap = new MayhemWeakMap();

		weakMap.set(key, 'test');
		assert.strictEqual(weakMap.get(key), 'test', 'set value should be gettable');

		weakMap.clear();

		if (has('es6-weak-map')) {
			assert.strictEqual(weakMap.get(key), undefined, 'key should not be retrievable after clear()');
		}
		else {
			assert.strictEqual(weakMap.get(key), 'test', 'clear should be a no-op');
		}
	},

	'key: attribute node'() {
		if (!has('es6-weak-map') && !has('host-browser')) {
			this.skip('WeakMap shim only works in browser');
		}

		document.body.setAttribute('data-test', 'test');
		var key = document.body.getAttributeNode('data-test');
		var weakMap = new MayhemWeakMap();

		weakMap.set(key, 'test');
		assert.strictEqual(weakMap.get(key), 'test', 'set value should be gettable');
	},

	'key: text node'() {
		if (!has('es6-weak-map') && !has('host-browser')) {
			this.skip('WeakMap shim only works in browser');
		}

		var key = document.createTextNode('test');
		var weakMap = new MayhemWeakMap();

		document.body.appendChild(key);

		try {
			weakMap.set(key, 'test');
			assert.strictEqual(weakMap.get(key), 'test', 'set value should be gettable');
		}
		finally {
			document.body.removeChild(key);
		}
	},

	'key: object'() {
		if (!has('es6-weak-map') && !has('host-browser')) {
			this.skip('WeakMap shim only works in browser');
		}

		var key = document.createTextNode('test');;
		var weakMap = new MayhemWeakMap();
		var errorThrown = false;

		if (has('es6-weak-map') || has('es5')) {
			weakMap.set(key, 'test');
			assert.strictEqual(weakMap.get(key), 'test', 'set value should be gettable');
		}
		else {
			try {
				weakMap.set(key, 'test');
			}
			catch (error) {
				errorThrown = true;
			}

			assert.isTrue(errorThrown, 'using invalid key object should throw an error');
		}
	}
});
