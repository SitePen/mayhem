import has = require('./has');

var Ctor:typeof WeakMap;
interface Ctor<K, V> extends WeakMap<K, V> {}

interface Entry {
	node:Node;
	map:{};
}

if (has('es6-weak-map')) {
	Ctor = WeakMap;
}
else {
	var getSurrogate = function (key:any):{} {
		var owner:{ __bindingNodes?:Entry[]; } = key.parentNode || key.ownerElement;

		if (!owner) {
			throw new Error('Cannot use key without leaking');
		}

		var nodes:Entry[] = owner.__bindingNodes;
		if (!nodes) {
			nodes = owner.__bindingNodes = [];
		}

		for (var i = 0, maybeKey:Entry; (maybeKey = nodes[i]); ++i) {
			if (maybeKey.node === key) {
				return maybeKey.map;
			}
		}

		var map = {};
		nodes.push({ node: key, map: map });
		return map;
	};

	var mid:string = '__FakeWeakMap' + (new Date().getTime()) + String(Math.random()).slice(2);
	var oid:number = 0;
	var FakeWeakMap = <any> function FakeWeakMap() {
		this._id = mid + (++oid);
	};
	FakeWeakMap.prototype = {
		constructor: FakeWeakMap,
		clear: function ():void {
			// Without holding references to objects it is impossible to clean,
			// so this is a no-op
		},
		'delete': function (key:{}):void {
			if (has('dom-bad-expandos') && ((<any> key).nodeType === 2 || (<any> key).nodeType === 3)) {
				key = getSurrogate(<any> key);
			}

			delete (<any> key)[this._id];
		},
		get: function (key:{}):any {
			if (has('dom-bad-expandos') && ((<any> key).nodeType === 2 || (<any> key).nodeType === 3)) {
				key = getSurrogate(<any> key);
			}

			return (<any> key)[this._id];
		},
		has: function (key:{}):boolean {
			if (has('dom-bad-expandos') && ((<any> key).nodeType === 2 || (<any> key).nodeType === 3)) {
				key = getSurrogate(<any> key);
			}

			return this._id in key;
		},
		set: function (key:{}, value:any):void {
			if (has('es5')) {
				Object.defineProperty(key, this._id, {
					enumerable: false,
					configurable: true,
					value: value,
					writable: true
				});
			}
			else {
				if (has('dom-bad-expandos') && ((<any> key).nodeType === 2 || (<any> key).nodeType === 3)) {
					key = getSurrogate(<any> key);
				}

				(<any> key)[this._id] = value;
			}
		}
	};

	Ctor = FakeWeakMap;
}

export = Ctor;
