/// <amd-dependency path="../renderer!Error" />

import form = require('./interfaces');
import View = require('../View');

var Renderer:any = require('../renderer!Error');

class FormError extends View implements form.IErrorImpl {
	private _observerHandle:IHandle;
	/* protected */ _values:form.IErrorValues;

	get:form.IErrorGet;
	set:form.IErrorSet;

	destroy():void {
		this.destroy = function ():void {};
		this._observerHandle.remove();
		this._observerHandle = null;
	}

	private _listSetter(list:form.ValidationError[]):void {
		this._observerHandle && this._observerHandle.remove();
		if (!list) {
			return this._renderer.clear(this);
		}
		this._renderer.renderList(this, list);
		// Observe if ObservableArray
		if (typeof list.observe === 'function') {
			this._observerHandle = list.observe(() => {
				this._renderer.renderList(this, list);
			});
		}
	}
}

FormError.prototype._renderer = new Renderer();

export = FormError;
