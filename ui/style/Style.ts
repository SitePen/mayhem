import core = require('../../interfaces');
import Observable = require('../../Observable');
import style = require('./interfaces');
import util = require('../../util');

class Style extends Observable /* TODO: implements style.IStyle */ {
	private _globalObservers:core.IObserver<any>[];

	constructor(kwArgs?:Object) {
		this._globalObservers = [];
		super(kwArgs);
	}

	_notify(newValue:any, oldValue:any, key:string) {
		super._notify(newValue, oldValue, key);

		var observers = this._globalObservers.slice(0);
		for (var i = 0, observer:core.IObserver<any>; (observer = observers[i]); ++i) {
			observer.call(this, newValue, oldValue, key);
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
				remove: function () {
					this.remove = function () {};
					util.spliceMatch(observers, observer);
					observers = observer = null;
				}
			};
		}
	}
}

export = Style;
