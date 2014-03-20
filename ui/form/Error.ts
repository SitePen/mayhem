/// <amd-dependency path="../renderer!form/Error" />

import core = require('../../interfaces');
import form = require('./interfaces');
import View = require('../View');

var Renderer:any = require('../renderer!form/Error');

class FormError extends View implements form.IError {
	private _observerHandle:IHandle;
	/* protected */ _values:form.IErrorValues;

	get:form.IErrorGet;
	set:form.IErrorSet;

	destroy():void {
		this.destroy = function ():void {};
		this._observerHandle.remove();
		this._observerHandle = null;
	}

	private _listSetter(list:core.IValidationError[]):void {
		this._observerHandle && this._observerHandle.remove();
		if (!list) {
			return this._renderer.clear(this);
		}
		this._renderer.renderList(this, list);
		// Observe if ObservableArray
		if (typeof list['observe'] === 'function') {
			this._observerHandle = list['observe'](() => {
				this._renderer.renderList(this, list);
			});
		}
	}
}

FormError.prototype._renderer = new Renderer();

export = FormError;
