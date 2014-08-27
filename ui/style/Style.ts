import core = require('../../interfaces');
import has = require('../../has');
import Observable = require('../../Observable');
import style = require('./interfaces');
import util = require('../../util');
import lang = require('dojo/_base/lang');

class Style extends Observable implements style.IStyle {
	static parse(value:any = {}):any {
		// TODO: moar correct?
		if (typeof value !== 'string') {
			return value;
		}
		var pattern = /\s*([^:]+?)\s*\:\s*([^:]+?)\s*/,
			rules = value.split(';'),
			value:any = {},
			parts:string[];
		for (var i = 0, len = rules.length; i < len; ++i) {
			parts = rules[i].split(':');
			if (parts.length === 2 && parts[0]) {
				value[parts[0]] = lang.trim(parts[1]);
			}
		}
		return value;
	}

	private _globalObservers:core.IObserver<any>[];

	constructor(kwArgs?:Object) {
		this._globalObservers = [];
		super(kwArgs);
	}

	_notify(newValue:any, oldValue:any, key:string):void {
		super._notify(key, newValue, oldValue);

		var observers = this._globalObservers.slice(0);
		for (var i = 0, observer:core.IObserver<any>; (observer = observers[i]); ++i) {
			observer.call(this, newValue, oldValue, key);
		}

		// TODO: do this check during set instead
		if (has('debug') && typeof key === 'string' && key.indexOf('-') !== -1) {
			throw new Error('CSS properties in JavaScript are camelCase, not hyphenated');
		}
	}

	observe(observer:core.IObserver<any>):IHandle;
	observe(key:string, observer:core.IObserver<any>):IHandle;
	observe(key:any, observer?:core.IObserver<any>):IHandle {
		if (observer) {
			return super.observe(key, observer);
		}
		else {
			observer = key;
			key = null;

			var observers = this._globalObservers;
			observers.push(observer);

			return {
				remove: function ():void {
					this.remove = function ():void {};
					util.spliceMatch(observers, observer);
					observers = observer = null;
				}
			};
		}
	}
}

export = Style;
