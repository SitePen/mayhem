/// <reference path="../dojo" />

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

class View extends Widget implements ui.IView {
	private _bindings:binding.IBindingHandle[];
	private _parentAppHandle:IHandle;
	private _parentMediatorHandle:IHandle;
	/* protected */ _values:ui.IViewValues;

	constructor(kwArgs?:ui.IViewValues) {
		this._bindings = [];
		super(kwArgs);
	}

	get:ui.IViewGet;
	set:ui.IViewSet;

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
		var binding:binding.IBindingHandle;
		for (var i = 0; (binding = this._bindings[i]); ++i) {
			binding.remove();
		}
		this._bindings = null;

		super.destroy();
	}

	/* protected */ _initialize():void {
		super._initialize();

		this.observe('mediator', (mediator:data.IMediator):void => {
			if (!mediator) { return; }
			// when the mediator changes, update any bindings
			for (var i = 0, binding:binding.IBindingHandle; (binding = this._bindings[i]); i++) {
				binding.setSource(mediator);
			}
		});

		this.observe('parent', (parent:ui.IContainer, previous:ui.IContainer) => {
			if (!this.get('app') && parent) {
				var parentApp = parent.get('app');
				if (parentApp) {
					this.set('app', parentApp);
				}
				else {
					// Wait for parent's app (only once)
					this._parentAppHandle = parent.observe('app', (parentApp:core.IApplication):void => {
						this._parentAppHandle.remove();
						this._parentAppHandle = null;
						this.set('app', parentApp);
					});
				}
			}

			var mediatorHandler = (mediator:data.IMediator, previous:data.IMediator):void => {
				// if no mediator has been explicitly set, notify of the parent's mediator change
				if (!this._values.mediator && !util.isEqual(mediator, previous)) {
					this._notify(mediator, previous, 'mediator');
				}
			};
			util.remove(this._parentMediatorHandle);
			this._parentMediatorHandle = parent && parent.observe('mediator', mediatorHandler);
			mediatorHandler(parent && parent.get('mediator'), previous && previous.get('mediator'));
		})
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
}

export = View;
