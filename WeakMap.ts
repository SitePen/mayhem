import has = require('./has');

var Ctor:typeof WeakMap;
interface Ctor<K, V> extends WeakMap<K, V> {}

if (has('es6-weak-map')) {
	Ctor = WeakMap;
}
else {
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
		delete: function (key:{}):void {
			delete (<any> key)[this._id];
		},
		get: function (key:{}):any {
			return (<any> key)[this._id];
		},
		has: function (key:{}):boolean {
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
				(<any> key)[this._id] = value;
			}
		}
	};

	Ctor = FakeWeakMap;
}

export = Ctor;
