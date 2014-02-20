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
	platform = has('host-browser') ? 'dom/' : '',
	registry = {};

class Widget extends ObservableEvented implements widgets.IWidget {
	static byId(id:string):widgets.IWidget {
		return registry[id];
	}

	static load(resourceId:string, contextRequire:Function, load:(...modules:any[]) => void):void {
		require([ resourceId ], load);
	}

	static normalize(resourceId:string, normalize:(id:string) => string):string {
		return normalize('./' + platform + resourceId);
	}


	private _activeMediator:core.IMediator;
	private _app:core.IApplication;
	/* protected */ _attached:boolean;
	private _bindings:binding.IBindingHandle[];
	private _classList:widgets.IClassList;
	/* protected */ _id:string;
	/* protected */ _mediator:core.IMediator;
	/* protected */ _parent:widgets.IContainerWidget;
	private _parentAttachedHandle:IHandle;
	private _parentMediatorHandle:IHandle;
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

	constructor(kwArgs:Object = {}) {
		// Set ID as early as possible so that any setters that might require it can use it
		var id:string = kwArgs['id'];
		if (!id) {
			id = this._id = 'Widget' + (++uid);
		}
		// TDOO: check registry for duplicate id and throw?
		// Helpful for debugging
		registry[id] = this;

		this._bindings = [];
		this._classList = new ClassList();
		this._style = new Style();

		super(kwArgs);

		this._render();
	}

	/* protected */ _activeMediatorSetter(mediator:core.IMediator):void {
		this._activeMediator = mediator;
		for (var i = 0, binding:binding.IBindingHandle; (binding = this._bindings[i]); ++i) {
			binding.setSource(mediator);
		}
	}

	/* protected */ _attachedSetter(attached:boolean):void {
		this._attached = attached;
	}

	// TODO: support using a binding template as a sourceBinding
	bind(targetBinding:string, binding:string, options?:{ direction?:BindDirection; }):IHandle;
	bind(targetBinding:Node, binding:string, options?:{ direction?:BindDirection; }):IHandle;
	bind(targetBinding:any, binding:string, options:{ direction?:BindDirection; } = {}):IHandle {
		var target:any = this,
			bindings = this._bindings,
			handle:binding.IBindingHandle;
		// Special handling for binding node targets
		if (targetBinding instanceof Node) {
			target = targetBinding;
			targetBinding = 'nodeValue';
		}
		handle = this.get('app').get('binder').bind({
			source: this.get('mediator'),
			sourceBinding: binding,
			target: target,
			targetBinding: targetBinding,
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

	clear():void {}

	private _mediatorGetter():core.IMediator {
		return this._activeMediator;
	}

	/* protected */ _mediatorSetter(mediator:core.IMediator):void {
		this._mediator = mediator;
		this.set('activeMediator', mediator);
	}

	private _nextGetter():widgets.IWidget {
		var parent = this.get('parent');

		if (!parent) {
			return null;
		}

		var index:number = parent.get('children').indexOf(this);
		return parent.get('children')[index + 1];
	}

	/* protected */ _parentSetter(parent:widgets.IContainerWidget):void {
		this._parent = parent;
		// Observe parent active mediator
		this._parentMediatorHandle && this._parentMediatorHandle.remove();
		var parentMediatorHandler = (parentMediator:core.IMediator):void => {
			if (!this._mediator) {
				this.set('activeMediator', parentMediator);
			}
		};
		this._parentMediatorHandle = parent.observe('activeMediator', parentMediatorHandler);
		// Don't set activeMediator if parent hasn't had mediator set
		var parentMediator:core.IMediator = parent.get('mediator');
		parentMediator && parentMediatorHandler(parentMediator);

		// Observe parent's attached state
		this._parentAttachedHandle && this._parentAttachedHandle.remove();
		this._parentAttachedHandle = parent.observe('attached', (parentAttached:boolean):void => {
			this._attached !== parentAttached && this.set('attached', parentAttached);
		});
		parent.get('attached') && this.set('attached', true);
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
