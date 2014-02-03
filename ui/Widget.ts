/// <reference path="../dojo" />

import array = require('dojo/_base/array');
import BindDirection = require('../binding/BindDirection');
import binding = require('../binding/interfaces');
import ClassList = require('./style/ClassList');
import core = require('../interfaces');
import has = require('../has');
import ObservableEvented = require('../ObservableEvented');
import PlacePosition = require('./PlacePosition');
import Style = require('./style/Style');
import style = require('./style/interfaces');
import util = require('../util');
import widgets = require('./interfaces');

var uid = 0,
	platform = has('host-browser') ? 'dom/' : '';

// TODO: Create and use ObservableEvented
class Widget extends ObservableEvented implements widgets.IWidget {

	static load(resourceId:string, contextRequire:Function, load:(...modules:any[]) => void):void {
		require([ resourceId ], load);
	}

	static normalize(resourceId:string, normalize:(id:string) => string):string {
		return normalize('./' + platform + resourceId);
	}

	/* protected */ app:core.IApplication;
	private _bindings:binding.IBindingHandle[];
	/* protected */ classList:widgets.IClassList;
	/* protected */ id:string;
	/* protected */ index:number;
	// TODO: Not sure if mediator belongs here. Should go to IView?
	/* protected */ mediator:core.IMediator;
	/* protected */ parent:widgets.IContainerWidget;
	/* protected */ style:Style;

	constructor(kwArgs:Object = {}) {
		this._bindings = [];

		// Set ID as early as possible so that any setters that might require it can use it
		if (!('id' in kwArgs)) {
			this.id = 'Widget' + (++uid);
		}

		this.classList = new ClassList();
		this.style = new Style();

		super(kwArgs);
	}

	// TODO: it's not always possible to do a strait widget.bind (e.g. array targets)
	// but we still want binds cleaned up consistently so we can just expose the capability to add
	/* protected */ addBinding(binding:binding.IBindingHandle) {
		this._bindings.push(binding);
	}

	// TODO: Change bind options to be an interface
	bind(propertyName:string, binding:string, options:{ direction?:BindDirection; } = {}):IHandle {
		var bindings = this._bindings,
			handle:binding.IBindingHandle = this.app.binder.bind({
				source: this.get('mediator'),
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

	empty():void {

	}

	get(key:'app'):core.IApplication;
	get(key:'classList'):widgets.IClassList;
	get(key:'id'):string;
	get(key:'index'):number;
	get(key:'mediator'):core.IMediator;
	get(key:'next'):widgets.IWidget;
	get(key:'parent'):widgets.IContainerWidget;
	get(key:'previous'):widgets.IWidget;
	get(key:'style'):Style;
	get(key:string):any;
	get(key:string):any {
		return super.get(key);
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
		this.parent.remove && this.parent.remove(this);
	}

	private _mediatorGetter():core.IMediator {
		return this.mediator || (this.parent ? this.parent.get('mediator') : null);
	}

	/* protected */ _mediatorSetter(value:core.IMediator):void {
		this.mediator = value;
		for (var i = 0, binding:binding.IBindingHandle; (binding = this._bindings[i]); ++i) {
			binding.setSource(value);
		}

		// TODO: Notify all children with null mediators of an update to the parent viewscope mediator
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

		var destinationParent:widgets.IContainerWidget = destination.get('parent');

		if (position === PlacePosition.BEFORE) {
			if (has('debug') && !destinationParent) {
				throw new Error('Destination widget ' + destination.get('id') + ' must have a parent in order to place before it');
			}

			handle = destinationParent.add(this, destination.get('index'));
		}
		else if (position === PlacePosition.AFTER) {
			if (has('debug') && !destinationParent) {
				throw new Error('Destination widget ' + destination.get('id') + ' must have a parent in order to place after it');
			}

			handle = destinationParent.add(this, destination.get('index') + 1);
		}
		else if (position === PlacePosition.REPLACE) {
			if (has('debug') && !destinationParent) {
				throw new Error('Destination widget ' + destination.get('id') + ' must have a parent in order to replace it');
			}

			var index:number = destination.get('index'),
				parent:widgets.IContainer = destinationParent;
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
