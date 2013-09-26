/// <reference path="../interfaces.ts" />
/// <reference path="../binding/interfaces.ts" />

import Component = require('../Component');

class Widget extends Component implements IWidget {
	private _bindings:Object;
	private _mediator:IMediator;

	private _mediatorGetter():IMediator {
		return this._mediator || this.parent.mediator;
	}

	private _mediatorSetter(value?:IMediator):void {
		this._mediator = value;
		this._bindings.forEach(function (binding:IDataBinderHandle) {
			binding.to = value;
		});
	}

	bind(propertyName:string, binding:string):IDataBinderHandle {
		var handle:IDataBinderHandle = this.app.dataBindingRegistry({
			from: this,
			property: propertyName,
			// where it goes depends on the syntax!
			// foo -> mediator.foo
			// mediator.foo -> mediator.foo
			// model.foo -> mediator.model.foo
			// app.foo -> mediator.app.foo
			to: this.get('mediator'),
			binding: binding
		});
		this._bindings.push(handle);
		return handle;
	}
}
