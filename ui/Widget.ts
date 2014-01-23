/// <reference path="../dojo.d.ts" />

import BindDirection = require('../binding/BindDirection');
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
	/* readonly */ next:widgets.IWidget;
	parent:widgets.IContainerWidget;
	/* readonly */ previous:widgets.IWidget;
	style:style.IStyle;

	constructor(kwArgs:any) { // can't use Object -- maybe define IWidgetOptions?
		this.app = kwArgs.app;
		this.mediator = kwArgs.mediator;
		this._bindings = [];
		super(kwArgs);

		if (!this.id) {
			this.id = 'Widget' + (++uid);
		}
	}

	// TODO: Change bind options to be an interface
	bind(propertyName:string, binding:string, options:{ direction?:BindDirection; } = {}):IHandle {
		var bindings = this._bindings,
			handle:binding.IBindingHandle = this.app.binder.bind({
				source: this.mediator,
				sourceBinding: binding,
				target: this,
				targetBinding: propertyName,
				direction: options.direction || BindDirection.ONE_WAY
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

	destroy():void {
		this.destroy = function () {};

		this.detach();

		var binding:binding.IBindingHandle;
		for (var i = 0; (binding = this._bindings[i]); ++i) {
			binding.remove();
		}

		this._bindings = this.mediator = this.app = null;
	}

	detach():void {
		this.parent && this.parent.remove(this);
	}

	private _mediatorGetter():core.IMediator {
		return this.mediator || (this.parent ? this.parent.get('mediator') : null);
	}

	/* protected */ _mediatorSetter(value:core.IMediator):void {
		this.mediator = value;
		for (var i = 0, binding:binding.IBindingHandle; (binding = this._bindings[i]); ++i) {
			binding.setSource(value);
		}
	}

	private _nextGetter():widgets.IWidget {
		var index:number = this.parent.children.indexOf(this);
		return this.parent.children[index + 1];
	}

	placeAt(destination:widgets.IWidget, position:PlacePosition):IHandle;
	placeAt(destination:widgets.IContainerWidget, position:number):IHandle;
	placeAt(destination:widgets.IContainerWidget, placeholder:string):IHandle;
	placeAt(destination:widgets.IContainerWidget, position:any = PlacePosition.LAST):IHandle {
		var handle:IHandle;

		if (has('debug') && !destination) {
			throw new Error('Cannot place widget at undefined destination');
		}

		if (position === PlacePosition.BEFORE) {
			if (has('debug') && !destination.parent) {
				throw new Error('Destination widget ' + destination.id + ' must have a parent in order to place before it');
			}

			handle = destination.parent.add(this, destination.index);
		}
		else if (position === PlacePosition.AFTER) {
			if (has('debug') && !destination.parent) {
				throw new Error('Destination widget ' + destination.id + ' must have a parent in order to place after it');
			}

			handle = destination.parent.add(this, destination.index + 1);
		}
		else if (position === PlacePosition.REPLACE) {
			if (has('debug') && !destination.parent) {
				throw new Error('Destination widget ' + destination.id + ' must have a parent in order to replace it');
			}

			var index:number = destination.get('index'),
				parent:widgets.IContainer = destination.get('parent');
			destination.detach();
			handle = parent.add(this, index);
		}
		else {
			handle = destination.add(this, position);
		}

		return handle;
	}

	private _previousGetter():widgets.IWidget {
		var index:number = this.parent.children.indexOf(this);
		return this.parent.children[index - 1];
	}
}

export = Widget;
