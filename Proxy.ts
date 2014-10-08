import binding = require('./binding/interfaces');
import core = require('./interfaces');
import has = require('./has');
import Observable = require('./Observable');
import util = require('./util');

class Proxy extends Observable {
	private _app:core.IApplication;

	/**
	 * @protected
	 */
	_target:{ get?:(key:string) => any; };

	private _targetHandles:HashMap<binding.IBinding<any, any>>;

	get:Proxy.Getters;
	set:Proxy.Setters;

	constructor(kwArgs:HashMap<any>) {
		// TS7017
		var _kwArgs:{ [key:string]:any; app?:core.IApplication; target?:any; } = kwArgs;

		// TODO: Bad idea?
		if (_kwArgs.target && !_kwArgs.app) {
			this._app = this._target.get ? this._target.get('app') : _kwArgs.target.app;
		}

		super(_kwArgs);
	}

	_initialize():void {
		this._targetHandles = has('es5') ? Object.create(null) : {};
	}

	private _createTargetBinding(key:string):void {
		var self = this;
		var binding = this._targetHandles[key] = this._app.get('binder').createBinding(this._target, key, { schedule: false });
		binding.observe(function (newValue:any, oldValue:any):void {
			self._notify(key, newValue, oldValue);
		});
	}

	destroy():void {
		var handles = this._targetHandles;

		for (var key in handles) {
			handles[key] && handles[key].destroy();
		}

		this._targetHandles = this._target = null;
		super.destroy();
	}

	observe(key:any, observer:core.IObserver<any>):IHandle {
		var privateKey:string = '_' + key;
		var getter:string = privateKey + 'Getter';
		// TS7017
		var hasOwnKey:boolean = (privateKey in this) || typeof (<any> this)[getter] === 'function';

		if (!this._targetHandles[key] && this._target && !hasOwnKey) {
			this._createTargetBinding(key);
		}

		return super.observe(key, observer);
	}

	setTarget(target:{ get?:(key:string) => void; }):void {
		this._target = target;

		var handles:HashMap<binding.IBinding<any, any>> = this._targetHandles;
		for (var key in handles) {
			handles[key] && handles[key].destroy();

			if (target) {
				this._createTargetBinding(key);
				// TS7017
				this._notify(key, target.get ? target.get(key) : (<any> target)[key], undefined);
			}
		}
	}
}

module Proxy {
	export interface Getters extends Observable.Getters {}
	export interface Setters extends Observable.Setters {}
}

Proxy.prototype.get = function (key:string):any {
	var value:any = Observable.prototype.get.apply(this, arguments);
	if (value === undefined && this._target) {
		value = this._target.get ? this._target.get(key) : this._target[key];
	}

	return value;
};

Proxy.prototype.set = function (key:any, value?:any):void {
	if (util.isObject(key)) {
		Observable.prototype.set.apply(this, arguments);
		return;
	}

	// TODO: Remove prefix
	var privateKey:string = '_' + key;
	var setter:string = privateKey + 'Setter';

	if (typeof this[setter] === 'function' || (privateKey in this)) {
		Observable.prototype.set.apply(this, arguments);
	}
	else if (this._target) {
		return this._target.set ? this._target.set(key, value) : (this._target[key] = value);
	}
	else {
		return undefined;
	}
};

export = Proxy;
