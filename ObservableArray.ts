import core = require('./interfaces');
import has = require('./has');
import lang = require('dojo/_base/lang');
import util = require('./util');

// TODO: implements is commented out due to TS#1977
class ObservableArray<T> /* implements Array<T> */ {
	[n:number]:T;
	private _observers:core.IArrayObserver<T>[];
	length:number;

	constructor(array:T[] = []) {
		if (has('es5')) {
			Object.defineProperty(array, '_observers', { value: [] });
		}
		else {
			array['_observers'] = [];
		}

		// TODO: Weird intermediate casting to <any> is required due to TS#1977
		return <ObservableArray<T>> <any> lang.mixin(array, ObservableArray.prototype);
	}

	concat<U extends T[]>(...items:U[]):ObservableArray<T>;
	concat(...items:T[]):ObservableArray<T>;
	concat(...items:any[]):any {
		return new ObservableArray<T>(Array.prototype.concat.apply(this, items));
	}

	every(callbackfn:(value:T, index:number, array:T[]) => boolean, thisArg?:any):boolean {
		if (has('es5')) {
			return Array.prototype.every.apply(this, arguments);
		}
		else {
			for (var i = 0, j = this.length; i < j; ++i) {
				if (i in this && !callbackfn.call(thisArg, this[i], i, this)) {
					return false;
				}
			}

			return true;
		}
	}

	filter(callbackfn:(value:T, index:number, array:ObservableArray<T>) => boolean, thisArg?:any):ObservableArray<T> {
		var results:T[];
		if (has('es5')) {
			results = Array.prototype.filter.apply(this, arguments);
		}
		else {
			results = [];
			for (var i = 0, j = this.length; i < j; ++i) {
				if (i in this) {
					var value = this[i];
					if (callbackfn.call(thisArg, value, i, this)) {
						results.push(value);
					}
				}
			}
		}

		return new ObservableArray<T>(results);
	}

	forEach(callbackfn:(value:T, index:number, array:ObservableArray<T>) => void, thisArg?:any):void {
		if (has('es5')) {
			Array.prototype.forEach.apply(this, arguments);
		}
		else {
			for (var i = 0, j = this.length; i < j; ++i) {
				if (i in this) {
					callbackfn.call(thisArg, this[i], i, this);
				}
			}
		}
	}

	get(index:number):any {
		return this[index];
	}

	indexOf(searchElement:T, fromIndex?:number):number {
		if (has('es5')) {
			return Array.prototype.indexOf.apply(this, arguments);
		}
		else {
			var length = this.length,
				i = (fromIndex < 0 ? length - Math.abs(fromIndex) : fromIndex) || 0;

			for (; i < length; ++i) {
				if (i in this && this[i] === searchElement) {
					return i;
				}
			}

			return -1;
		}
	}

	join(separator?:string):string {
		return Array.prototype.join.apply(this, arguments);
	}

	lastIndexOf(searchElement:T, fromIndex?:number):number {
		if (has('es5')) {
			return Array.prototype.lastIndexOf.apply(this, arguments);
		}
		else {
			var length = this.length,
				i = (fromIndex < 0 ? length - Math.abs(fromIndex) : fromIndex) || (length - 1);

			for (; i >= 0; --i) {
				if (i in this && this[i] === searchElement) {
					return i;
				}
			}

			return -1;
		}
	}

	map<U>(callbackfn:(value:T, index:number, array:ObservableArray<T>) => U, thisArg?:any):ObservableArray<U> {
		var results:T[];
		if (has('es5')) {
			results = Array.prototype.map.apply(this, arguments);
		}
		else {
			results = [];
			for (var i = 0, j = this.length; i < j; ++i) {
				if (i in this) {
					results[i] = callbackfn.call(thisArg, this[i], i, this);
				}
			}
		}

		return new ObservableArray<T>(results);
	}

	private _notify(index:number, removals:T[], additions:T[]):void {
		var observers = this._observers.slice(0);
		for (var i = 0, callback:core.IArrayObserver<T>; (callback = observers[i]); ++i) {
			callback.call(this, index, removals, additions);
		}
	}

	pop():T {
		return this.splice(this.length - 1, 1)[0];
	}

	push(...items:T[]):number {
		this.splice.apply(this, [ this.length, 0 ].concat(<any[]> items));
		return this.length;
	}

	reduce(callbackfn: (previousValue: T, currentValue: T, currentIndex: number, array: T[]) => T, initialValue?: T): T;
	reduce<U>(callbackfn: (previousValue: U, currentValue: T, currentIndex: number, array: T[]) => U, initialValue: U): U;
	reduce(callbackfn:Function, initialValue?:any):any {
		if (has('es5')) {
			return Array.prototype.reduce.apply(this, arguments);
		}
		else {
			var result:any = initialValue;
			for (var i = 0, j = this.length; i < j; ++i) {
				if (i in this) {
					result = callbackfn(result, this[i], i, this);
				}
			}

			return result;
		}
	}

	reduceRight(callbackfn: (previousValue: T, currentValue: T, currentIndex: number, array: T[]) => T, initialValue?: T): T;
	reduceRight<U>(callbackfn: (previousValue: U, currentValue: T, currentIndex: number, array: T[]) => U, initialValue: U): U;
	reduceRight(callbackfn:Function, initialValue?:any):any {
		if (has('es5')) {
			return Array.prototype.reduceRight.apply(this, arguments);
		}
		else {
			var result:any = initialValue;
			for (var i = this.length - 1; i >= 0; --i) {
				if (i in this) {
					result = callbackfn(result, this[i], i, this);
				}
			}

			return result;
		}
	}

	reverse():ObservableArray<T> {
		var removals = Array.prototype.slice.call(this, 0);
		Array.prototype.reverse.call(this);
		// TODO: Weird intermediate casting to <any> is required due to TS#1977
		this._notify(0, removals, <T[]> <any> this);
		return this;
	}

	set(index:number, value:T):void {
		var oldValue = this[index];
		this[index] = value;
		this._notify(index, [ oldValue ], [ value ]);
	}

	shift():T {
		return this.splice(0, 1)[0];
	}

	slice(start:number, end?:number):ObservableArray<T> {
		return new ObservableArray<T>(Array.prototype.slice.apply(this, arguments));
	}

	some(callbackfn:(value:T, index:number, array:T[]) => boolean, thisArg?:any):boolean {
		if (has('es5')) {
			return Array.prototype.every.apply(this, arguments);
		}
		else {
			for (var i = 0, j = this.length; i < j; ++i) {
				if (i in this && callbackfn.call(thisArg, this[i], i, this)) {
					return true;
				}
			}

			return false;
		}
	}

	sort(compareFn?:(a:T, b:T) => number):ObservableArray<T> {
		var removals = Array.prototype.slice.call(this, 0);
		Array.prototype.sort.apply(this, arguments);
		// TODO: Weird intermediate casting to <any> is required due to TS#1977
		this._notify(0, removals, <T[]> <any> this);
		return this;
	}

	splice(start:number):ObservableArray<T>;
	splice(start:number, deleteCount:number, ...items:T[]):ObservableArray<T>;
	splice(start:number, deleteCount:number = 0, ...items:T[]):ObservableArray<T> {
		var additions = items,
			removals = Array.prototype.slice.call(this, start, deleteCount);

		Array.prototype.splice.apply(this, arguments);
		this._notify(start, removals, additions);

		return new ObservableArray<T>([]);
	}

	toArray():T[] {
		return Array.prototype.slice.call(this, 0);
	}

	unshift(...items:T[]):number {
		this.splice.apply(this, [ 0, 0 ].concat(<any[]> items));
		return this.length;
	}

	observe(callback:core.IArrayObserver<T>):IHandle {
		var observers = this._observers;
		observers.push(callback);
		return {
			remove: function () {
				this.remove = function () {};
				util.spliceMatch(observers, callback);
				observers = callback = null;
			}
		};
	}
}

ObservableArray.prototype.observe['type'] = 'array';
export = ObservableArray;