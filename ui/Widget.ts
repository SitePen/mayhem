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

class Widget extends ObservableEvented implements widgets.IWidget {
	static load(resourceId:string, contextRequire:Function, load:(...modules:any[]) => void):void {
		require([ resourceId ], load);
	}

	static normalize(resourceId:string, normalize:(id:string) => string):string {
		return normalize('./' + platform + resourceId);
	}

	private _app:core.IApplication;
	private _bindings:binding.IBindingHandle[];
	private _classList:widgets.IClassList;
	private _id:string;
	private _mediator:core.IMediator;
	private _style:Style;

	get(key:'app'):core.IApplication;
	get(key:'classList'):widgets.IClassList;
	get(key:'id'):string;
	get(key:'index'):number;
	// TODO: Not sure if mediator belongs here. Should go to IView?
	get(key:'mediator'):core.IMediator;
	get(key:'parent'):widgets.IContainerWidget;
	get(key:'style'):Style;
	get(key:string):void;
	get(key:string):any {
		return super.get(key);
	}

	set(key:'mediator', value:core.IMediator):void;
	set(kwArgs:{ [key:string]: any; }):void;
	set(key:string, value:any):void;
	set(key:string, value?:any):void {
		return super.set(key, value);
	}

	constructor(kwArgs?:Object) {
		// Set ID as early as possible so that any setters that might require it can use it
		if (!kwArgs || !kwArgs['id']) {
			this._id = 'Widget' + (++uid);
		}

		this._bindings = [];
		this._classList = new ClassList();
		this._style = new Style();

		super(kwArgs);

		this._render();
	}

	// TODO: it's not always possible to do a strait widget.bind (e.g. array targets)
	// but we still want binds cleaned up consistently so we can just expose the capability to add
	/* protected */ addBinding(binding:binding.IBindingHandle):void {
		this._bindings.push(binding);
	}

	// TODO: Change bind options to be an interface
	bind(propertyName:string, binding:string, options:{ direction?:BindDirection; } = {}):IHandle {
		var bindings = this._bindings,
			handle:binding.IBindingHandle = this.get('app').get('binder').bind({
				source: this.get('mediator'),
				sourceBinding: binding,
				target: this,
				targetBinding: propertyName,
				direction: options.direction || BindDirection.ONE_WAY
			});

		bindings.push(handle);
		return {
			remove: function ():void {
				this.remove = function ():void {};
				handle.remove();
				util.spliceMatch(bindings, handle);
				bindings = handle = null;
			}
		};
	}

	destroy():void {
		this.detach();

		var binding:binding.IBindingHandle;
		for (var i = 0; (binding = this._bindings[i]); ++i) {
			binding.remove();
		}

		this._bindings = null;
		super.destroy();
	}

	detach():void {
		var parent = this.get('parent');
		parent.remove && parent.remove(this);
	}

	empty():void {}

	private _mediatorGetter():core.IMediator {
		var mediator:core.IMediator = this._mediator;
		if (!mediator) {
			var parent = this.get('parent');
			if (parent) {
				mediator = parent.get('mediator');
			}
		}

		return mediator;
	}

	/* protected */ _mediatorSetter(value:core.IMediator):void {
		this._mediator = value;
		for (var i = 0, binding:binding.IBindingHandle; (binding = this._bindings[i]); ++i) {
			binding.setSource(value);
		}

		// TODO: Notify all children with null mediators of an update to the parent viewscope mediator
	}

	private _nextGetter():widgets.IWidget {
		var parent = this.get('parent');

		if (!parent) {
			return null;
		}

		var index:number = parent.get('children').indexOf(this);
		return parent.get('children')[index + 1];
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
		var parent = this.get('parent');

		if (!parent) {
			return null;
		}

		var index:number = parent.get('children').indexOf(this);
		return parent.get('children')[index - 1];
	}

	/* abstract protected */ _render():void {
		if (has('debug')) {
			throw new Error('_render is not implemented');
		}
	}
}

export = Widget;
