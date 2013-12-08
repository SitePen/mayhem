import binding = require('../binding/interfaces');
import core = require('../interfaces');
import lang = require('dojo/_base/lang');
import PlacePosition = require('./PlacePosition');
import StatefulEvented = require('../StatefulEvented');
import style = require('./style/interfaces');
import util = require('../util');
import widgets = require('./interfaces');

var uid = 0;

class Widget extends StatefulEvented implements widgets.IWidget {
	id:string;
	style:style.IStyle;
	classList:widgets.IClassList;
	app:core.IApplication;
	previous:widgets.IWidget;
	next:widgets.IWidget;
	parent:widgets.IContainer;
	mediator:core.IMediator;

	private _bindings:binding.IBindingHandle[];

	constructor(kwArgs:Object) {
		super(kwArgs);

		if (!this.id) {
			this.id = 'Widget' + (++uid);
		}
	}

	private _mediatorGetter():core.IMediator {
		return this.mediator || this.parent.get('mediator');
	}

	private _mediatorSetter(value?:core.IMediator):void {
		this.mediator = value;
		for (var i = 0, binding:binding.IBindingHandle; (binding = this._bindings[i]); ++i) {
			binding.setSource(value);
		}
	}

	placeAt(destination:widgets.IContainer, position:PlacePosition):IHandle;
	placeAt(destination:widgets.IContainer, position:number):IHandle;
	placeAt(destination:widgets.IContainer, placeholder:string):IHandle;
	placeAt(destination:widgets.IContainer, position:any = PlacePosition.LAST):IHandle {
		var handle:IHandle;

		// TODO: IWidget.index?
		if (position === PlacePosition.BEFORE) {
			handle = destination.parent.add(this, destination.parent.getChildIndex(destination));
		}
		else if (position === PlacePosition.AFTER) {
			handle = destination.parent.add(this, destination.parent.getChildIndex(destination) + 1);
		}
		else if (position === PlacePosition.REPLACE) {
			var index = destination.parent.getChildIndex(destination),
				parent = destination.parent;
			destination.destroy();
			handle = parent.add(this, index);
		}
		else {
			handle = destination.add(this, position);
		}

		return handle;
	}

	bind(propertyName:string, binding:string):IHandle {
		var bindings = this._bindings,
			handle:binding.IBindingHandle = this.app.dataBindingRegistry.bind({
				source: this.mediator,
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
		var binding:binding.IBindingHandle;
		for (var i = 0; (binding = this._bindings[i]); ++i) {
			binding.remove();
		}

		this._bindings = this.mediator = this.app = null;
	}
}

export = Widget;
