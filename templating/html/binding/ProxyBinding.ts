import binding = require('../../../binding/interfaces');
import BindDirection = require('../../../binding/BindDirection');
import Binding = require('../../../binding/Binding');
import lang = require('dojo/_base/lang');

class ProxyBinding<T> extends Binding<T> {
	private _object:{};
	private _path:string;
	private _source:binding.IBinding<T>;

	static test(kwArgs:binding.IBindingArguments):boolean {
		return false;
	}

	constructor(kwArgs:binding.IBindingArguments) {
		super(kwArgs);
		this._object = kwArgs.object;
		this._path = kwArgs.path;
		this._switchSource();
	}

	destroy():void {
		super.destroy();
		this._source && this._source.destroy();
		this._source = this._object = this._path = null;
	}

	get():T {
		return this._source ? this._source.get() : undefined;
	}

	getObject():{} {
		return this._source ? this._source.getObject() : undefined;
	}

	// TODO: For compatibility with IBindingHandle; remove once IBindingHandle is gone
	remove():void {
		this.destroy();
	}

	set(value:T):void {
		this._source && this._source.set(value);
	}

	// TODO: For compatibility with IBindingHandle; remove once IBindingHandle is gone
	setDirection(direction:BindDirection):void {}

	setObject(value:{}):void {
		this._object = value;
		this._switchSource();
	}

	setPath(value:string):void {
		this._path = value;
		this._switchSource();
	}

	// TODO: For compatibility with IBindingHandle; remove once IBindingHandle is gone
	setSource(object:{}, path?:string):void {
		this.setObject(object);
		path && this.setPath(path);
	}

	// TODO: For compatibility with IBindingHandle; remove once IBindingHandle is gone
	setTarget(object:{}, path?:string):void {}

	private _switchSource():void {
		var oldValue:T;
		if (this._source) {
			oldValue = this._source.get();
			this._source.destroy();
		}

		this._source = this._binder.createBinding<T>(this._object, this._path, { useScheduler: false });
		this._source.observe(lang.hitch(this, 'notify'));
		this.notify({ oldValue: oldValue, value: this._source.get() });
	}
}

export = ProxyBinding;
