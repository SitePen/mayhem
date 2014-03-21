import AddPosition = require('./AddPosition');
import BindDirection = require('../binding/BindDirection');
import binding = require('../binding/interfaces');
import core = require('../interfaces');
import data = require('../data/interfaces');
import has = require('../has');
import lang = require('dojo/_base/lang');
import PlacePosition = require('./PlacePosition');
import ui = require('./interfaces');
import util = require('../util');
import Widget = require('./Widget');

class Mediated extends Widget implements ui.IMediated {
	private _attachedWidgets:ui.IWidget[];
	private _bindings:binding.IBindingHandle[];
	private _parentAppHandle:IHandle;
	private _parentMediatorHandle:IHandle;
	/* protected */ _values:ui.IMediatedValues;

	constructor(kwArgs?:ui.IMediatedValues) {
		this._attachedWidgets = [];
		this._bindings = [];
		super(kwArgs);
	}

	get:ui.IMediatedGet;
	set:ui.IMediatedSet;

	// Set widget parent and bind widget's attached state to parent
	// This doesn't fully express parent/child relationship, just the parent side (to propagate attachment information)
	attach(widget:ui.IWidget):void {
		this._attachedWidgets.push(widget);
		widget.set('parent', this);
		var attached = this.get('attached');
		attached !== undefined && widget.set('attached', attached);
		// On widget detach extract from attachedWidgets array
		var handle = widget.on('detached', () => {
			handle.remove();
			util.spliceMatch(this._attachedWidgets, widget);
			handle = widget = null;
		});
	}

	/* protected */ _bind(kwArgs:ui.IBindArguments):binding.IBindingHandle {
		return this.get('app').get('binder').bind({
			source: this.get('mediator'),
			sourceBinding: kwArgs.sourceBinding,
			target: kwArgs.target || this,
			targetBinding: kwArgs.targetBinding,
			direction: BindDirection[kwArgs.twoWay ? 'TWO_WAY' : 'ONE_WAY']
		});
	}

	bind(kwArgs:ui.IBindArguments):IHandle {
		kwArgs = lang.mixin(<any>{}, kwArgs);
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

					var bindHandle:IHandle = this.bind(kwArgs);
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
			// If no app is set on the widget, delay the binding until one exists
			return deferBind('app');
		}

		if (!this.get('mediator')) {
			// If no mediator is set on the widget, delay binding as well
			return deferBind('mediator');
		}

		var bindings = this._bindings,
			handle:binding.IBindingHandle;

		handle = this._bind(kwArgs);
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

		// Loop over attached widgets and de-parent them
		var widget:ui.IWidget;
		for (var i = 0; (widget = this._attachedWidgets[i]); ++i) {
			widget.set('parent', null);
		}

		var binding:binding.IBindingHandle;
		for (var i = 0; (binding = this._bindings[i]); ++i) {
			binding.remove();
		}
		this._bindings = null;

		super.destroy();
	}

	/* protected */ _initialize():void {
		super._initialize();

		this.observe('attached', (value:boolean):void => {
			// Propagate attachment information
			for (var i = 0, widget:ui.IWidget; (widget = this._attachedWidgets[i]); ++i) {
				widget.set('attached', value);
			}
		});

		this.observe('mediator', (mediator:data.IMediator):void => {
			if (!mediator) { return; }
			// when the mediator changes, update any bindings
			for (var i = 0, binding:binding.IBindingHandle; (binding = this._bindings[i]); i++) {
				binding.setSource(mediator);
			}
		});
	}

	private _mediatorGetter():data.IMediator {
		if (this._values.mediator) {
			return this._values.mediator;
		}
		var parent = this.get('parent');
		if (parent) {
			return parent.get('mediator');
		}
		return null;
	}

	/* protected */ _parentSetter(parent:ui.IContainer):void {
		// Pass app down to children
		// TODO: kill this
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

		var oldParent = this._values.parent;
		super._parentSetter(parent);

		this._parentMediatorHandle && this._parentMediatorHandle.remove();
		this._parentMediatorHandle = null;
		var mediatorHandler = (newMediator:data.IMediator, oldMediator:data.IMediator):void => {
			// if no mediator has been explicitly set, notify of the parent's mediator change
			if (!this._values.mediator && !util.isEqual(newMediator, oldMediator)) {
				this._notify(newMediator, oldMediator, 'mediator');
			}
		};
		if (parent) {
			this._parentMediatorHandle = parent.observe('mediator', mediatorHandler);
		}
		if (!this._values.mediator && !util.isEqual(parent, oldParent)) {
			mediatorHandler(parent && parent.get('mediator'), oldParent && oldParent.get('mediator'));
		}
	}
}

export = Mediated;
