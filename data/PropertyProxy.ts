import data = require('./interfaces');
import Promise = require('../Promise');
import Property = require('./Property');
import Proxy = require('../Proxy');
import ValidationError = require('../validation/ValidationError');

class PropertyProxy<T> extends Proxy implements data.IProperty<T> {
	get:PropertyProxy.Getters<T>;
	set:PropertyProxy.Setters<T>;

	/**
	 * @protected
	 */
	_target:Property<T>;

	addError(error:ValidationError):void {
		this._target && this._target.addError(error);
	}

	clearErrors():void {
		this._target && this._target.clearErrors();
	}

	validate():IPromise<boolean> {
		return Promise.resolve(this._target && this._target.validate());
	}
}

module PropertyProxy {
	export interface Getters<T> extends Proxy.Getters, data.IProperty.Getters<T> {}
	export interface Setters<T> extends Proxy.Setters, data.IProperty.Getters<T> {}
}

export = PropertyProxy;
