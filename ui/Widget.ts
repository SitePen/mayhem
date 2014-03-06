/// <reference path="../dojo" />

import array = require('dojo/_base/array');
import BindDirection = require('../binding/BindDirection');
import binding = require('../binding/interfaces');
import ClassList = require('./ClassList');
import core = require('../interfaces');
import has = require('../has');
import ObservableEvented = require('../ObservableEvented');
import PlacePosition = require('./PlacePosition');
import Style = require('./Style');
import ui = require('./interfaces');
import util = require('../util');

var uid = 0,
	platform = has('host-browser') ? 'dom/' : '',
	registry = {};

class Widget extends ObservableEvented implements ui.IWidget {
	static byId(id:string):ui.IWidget {
		return registry[id];
	}

	static load(resourceId:string, contextRequire:Function, load:(...modules:any[]) => void):void {
		require([ resourceId ], load);
	}

	static normalize(resourceId:string, normalize:(id:string) => string):string {
		return normalize('./' + platform + resourceId);
	}

	/* private */ _app:core.IApplication;
	private _attached:boolean;
	private _bindings:binding.IBindingHandle[];
	/* private */ _classList:ui.IClassList;
	/* protected */ _id:string;
	/* protected */ _mediator:core.IMediator;
	/* protected */ _parent:ui.IWidgetContainer;
	private _parentAppHandle:IHandle;
	private _parentAttachedHandle:IHandle;
	private _parentMediatorHandle:IHandle;
	/* private */ _style:ui.IStyle;

	get:ui.IWidgetGet;
	set:ui.IWidgetSet;

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

	/* protected */ _attachedSetter(attached:boolean):void {
		this._attached = attached;
	}

	/* protected */ _bind(target:any, targetBinding:string, binding:string, options:{ direction?:BindDirection; } = {}):binding.IBindingHandle {
		return this.get('app').get('binder').bind({
			source: this.get('mediator'),
			sourceBinding: binding,
			target: target,
			targetBinding: targetBinding,
			direction: options.direction || BindDirection.ONE_WAY
		});
	}

	// TODO: support using a binding template as a sourceBinding
	bind(targetBinding:string, binding:string, options?:{ direction?:BindDirection; }):IHandle;
	bind(targetBinding:Node, binding:string, options?:{ direction?:BindDirection; }):IHandle;
	bind(targetBinding:any, binding:string, options:{ direction?:BindDirection; } = {}):IHandle {
		var deferBind = (propertyName:string):IHandle => {
			// Helper to defer binding calls until a property has been set
			var handle:IHandle;
			if (!this.get(propertyName)) {
				var propertyHandle:IHandle = this.observe(propertyName, (value:any):void => {
					if (!value || !propertyHandle) {
						// value was not actually passed or binding was removed before this happened
						return;
					}
					propertyHandle.remove();

					var bindHandle:IHandle = this.bind(targetBinding, binding, options);
					handle.remove = function ():void {
						this.remove = function ():void {};
						bindHandle.remove();

						handle = propertyHandle = bindHandle = null;
					};
				});

			}
			handle = {
				remove: function ():void {
					this.remove = function ():void {};
					propertyHandle.remove();
					handle = propertyHandle = null;
				}
			};
			return handle;
		};
		if (!this.get('app')) {
			// if no app is set on the widget, delay the binding until one exists
			return deferBind('app');
		}

		if (!this.get('mediator')) {
			// if no mediator is set on the widget, delay binding as well
			return deferBind('mediator');
		}

		var target:any = this,
			bindings = this._bindings,
			handle:binding.IBindingHandle;
		// Special handling for binding node targets
		if (targetBinding instanceof Node) {
			target = targetBinding;
			targetBinding = 'nodeValue';
		}

		handle = this._bind(
			target,
			targetBinding,
			binding,
			options
		);

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

	clear():void {}

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
		parent && parent.remove && parent.remove(this);
		this.set('attached', false);
	}

	private _indexGetter():ui.IWidget {
		var parent = this.get('parent');
		if (!parent) {
			return null;
		}
		return parent.get('children').indexOf(this);
	}

	private _mediatorGetter():core.IMediator {
		if (this._mediator) {
			return this._mediator;
		}
		var parent = this.get('parent');
		if (parent) {
			return parent.get('mediator');
		}
		return null;
	}

	private _nextGetter():ui.IWidget {
		var parent = this.get('parent');
		if (!parent) {
			return null;
		}
		var index:number = this.get('index');
		return parent.get('children')[index + 1];
	}

	/* protected */ _parentSetter(parent:ui.IWidgetContainer):void {
		// Pass app down to children
		// TODO: kill this when Bryan finishes his binding refactor
		this._parentAppHandle && this._parentAppHandle.remove();
		if (!this.get('app')) {
			var parentApp:core.IApplication = parent.get('app');
			if (parentApp) {
				this.set('app', parentApp);
			}
			else {
				this._parentAppHandle = parent.observe('app', (parentApp:core.IApplication):void => {
					// Only once
					this._parentAppHandle.remove();
					this._parentAppHandle = null;
					this.set('app', parentApp);
				});
			}
		}

		this._parentMediatorHandle && this._parentMediatorHandle.remove();
		this._parentMediatorHandle = null;

		var mediatorHandler = (newMediator:core.IMediator, oldMediator:core.IMediator):void => {
			// if no mediator has been explicitly set, notify of the parent's mediator change
			if (!this._mediator && !util.isEqual(newMediator, oldMediator)) {
				this._notify(newMediator, oldMediator, 'mediator');
			}
		};
		if (parent) {
			this._parentMediatorHandle = parent.observe('mediator', mediatorHandler);
		}

		var oldParent:ui.IWidgetContainer = this._parent;
		this._parent = parent;

		if (!this._mediator && !util.isEqual(parent, oldParent)) {
			mediatorHandler(parent && parent.get('mediator'), oldParent && oldParent.get('mediator'));
		}
	}

	placeAt(destination:ui.IWidget, position:PlacePosition):IHandle;
	placeAt(destination:ui.IWidgetContainer, position:number):IHandle;
	placeAt(destination:ui.IWidgetContainer, placeholder:string):IHandle;
	placeAt(destination:any, position:any = PlacePosition.LAST):IHandle {
		var handle:IHandle;

		if (has('debug') && !destination) {
			throw new Error('Cannot place widget at undefined destination');
		}

		var destinationParent:ui.IWidgetContainer = destination.get('parent');

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
				parent:ui.IWidgetContainer = destinationParent;
			destination.detach();
			handle = parent.add(this, index);
		}
		else {
			handle = destination.add(this, position);
		}

		return handle;
	}

	private _previousGetter():ui.IWidget {
		var parent = this.get('parent');

		if (!parent) {
			return null;
		}

		var index:number = parent.get('children').indexOf(this);
		return parent.get('children')[index - 1];
	}

	/* protected */ _render():void {
		setTimeout(():void => {
			this.emit('render');
		});
	}
}

export = Widget;
