import has = require('./has');

var Ctor: typeof WeakMap;
interface Ctor<K, V> extends WeakMap<K, V> {}

interface Entry {
	node: Node;
	map: {};
}

if (has('es6-weak-map')) {
	Ctor = WeakMap;
}
else {
	var mid = '__FakeWeakMap' + (new Date().getTime()) + String(Math.random()).slice(2);
	var oid = 0;
	var FakeWeakMap = function FakeWeakMap() {
		this._id = mid + (++oid);
	};
	FakeWeakMap.prototype = {
		constructor: FakeWeakMap,
		'delete': function (key: {}) {
			delete (<any> key)[this._id];
		},
		get: function (key: {}) {
			return (<any> key)[this._id];
		},
		has: function (key: {}) {
			return this._id in key;
		},
		set: function (key: {}, value: any) {
			Object.defineProperty(key, this._id, {
				enumerable: false,
				configurable: true,
				value: value,
				writable: true
			});
		}
	};

	Ctor = <any> FakeWeakMap;
}

export = Ctor;
