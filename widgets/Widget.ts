import core = require('../interfaces');
import widgets = require('./interfaces');
import style = require('./style/interfaces');
import binding = require('../binding/interfaces');
import StatefulEvented = require('../StatefulEvented');
import lang = require('dojo/_base/lang');
import util = require('../util');

var uid = 0;

class Widget extends StatefulEvented implements widgets.IWidget {
	id:string;
	style:style.IStyle;
	classList:widgets.IClassList;
	app:core.IApplication;
	previous:widgets.IWidget;
	next:widgets.IWidget;
	parent:widgets.IWidget;

	private _mediator:core.IMediator;
	private _bindings:IBindingHandle[];

	constructor(kwArgs:Object) {
		super(kwArgs);

		if (!this.id) {
			this.id = 'Widget' + (++uid);
		}
	}

	private _mediatorGetter():core.IMediator {
		return this._mediator || this.parent.mediator;
	}

	private _mediatorSetter(value?:core.IMediator):void {
		this._mediator = value;
		// TODO: Reset all bindings to mediator
	}

	bind(propertyName:string, binding:string):IHandle {
		var bindings = this._bindings,
			handle:binding.IBindingHandle = this.app.dataBindingRegistry({
				source: this._mediator,
				sourceBinding: binding,
				target: this,
				targetBinding: propertyName
			});

		bindings.push(handle);
		return {
			remove: function () {
				this.remove = function () {};
				handle.remove();
				util.spliceMatch(bindings, handle);
			}
		};
	}

	destroy():void {
		var binding:IBindingHandle;
		for (var i = 0; (binding = this._bindings); ++i) {
			binding.remove();
		}

		this._bindings = this._mediator = this.app = null;
	}
}
