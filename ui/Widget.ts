/// <reference path="../dojo.d.ts" />

import binding = require('../binding/interfaces');
import core = require('../interfaces');
import has = require('../has');
import lang = require('dojo/_base/lang');
import PlacePosition = require('./PlacePosition');
import StatefulEvented = require('../StatefulEvented');
import style = require('./style/interfaces');
import util = require('../util');
import widgets = require('./interfaces');

var uid = 0,
	platform = has('host-browser') ? 'dom/' : '';

class Widget extends StatefulEvented implements widgets.IWidget {
	static load(resourceId:string, contextRequire:Function, load:(...modules:any[]) => void):void {
		require([ resourceId ], load);
	}

	static normalize(resourceId:string, normalize:(id:string) => string):string {
		return normalize('./' + platform + resourceId);
	}

	app:core.IApplication;
	private _bindings:binding.IBindingHandle[];
	classList:widgets.IClassList;
	id:string;
	index:number;
	// TODO: Not sure if mediator belongs here. Should go to IView?
	mediator:core.IMediator;
	next:widgets.IWidget;
	parent:widgets.IContainer;
	previous:widgets.IWidget;
	style:style.IStyle;

	constructor(kwArgs:Object) {
		super(kwArgs);

		if (!this.id) {
			this.id = 'Widget' + (++uid);
		}
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
				bindings = handle = null;
			}
		};
	}

	detach():void {
		this.parent = this.index = this.next = this.previous = null;
	}

	destroy():void {
		this.destroy = function () {};

		this.detach();

		var binding:binding.IBindingHandle;
		for (var i = 0; (binding = this._bindings[i]); ++i) {
			binding.remove();
		}

		this._bindings = this.mediator = this.app = null;
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

	placeAt(destination:widgets.IWidget, position:PlacePosition):IHandle;
	placeAt(destination:widgets.IContainer, position:number):IHandle;
	placeAt(destination:widgets.IContainer, placeholder:string):IHandle;
	placeAt(destination:widgets.IContainer, position:any = PlacePosition.LAST):IHandle {
		var handle:IHandle;

		if (position === PlacePosition.BEFORE) {
			handle = destination.parent.add(this, destination.index);
		}
		else if (position === PlacePosition.AFTER) {
			handle = destination.parent.add(this, destination.index + 1);
		}
		else if (position === PlacePosition.REPLACE) {
			var index = destination.index,
				parent = destination.parent;
			destination.detach();
			handle = parent.add(this, index);
		}
		else {
			handle = destination.add(this, position);
		}

		return handle;
	}
}

export = Widget;
