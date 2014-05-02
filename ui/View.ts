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
	private _parentModelHandle:IHandle;
	_model:core.data.IMediator;

	constructor(kwArgs?:any) {
		this._bindings = [];
		super(kwArgs);
	}

	get:ui.IViewGet;
	set:ui.IViewSet;

	/* protected */ _bind(kwArgs:ui.IBindArguments):binding.IBindingHandle {
		return this.get('app').get('binder').bind({
			source: this.get('model'),
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

		if (!this.get('model')) {
			// If no model is set on the widget, delay binding as well
			return deferBind('model');
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

	clear():void {
		this._renderer.clear(this);
	}

	destroy():void {
		var binding:binding.IBindingHandle;
		for (var i = 0; (binding = this._bindings[i]); ++i) {
			binding.remove();
		}
		this._bindings = null;

		super.destroy();
	}

	private _modelGetter():data.IMediator {
		if (this._model) {
			return this._model;
		}
		var parent = this.get('parent');
		if (parent) {
			return parent.get('model');
		}
		return null;
	}
}

View.observers({
	model: function (model:data.IMediator):void {
		if (!model) { return; }
		// when the model changes, update any bindings
		for (var i = 0, binding:binding.IBindingHandle; (binding = this._bindings[i]); i++) {
			binding.setSource(model);
		}
	},

	parent: function (parent:ui.IContainer, previous:ui.IContainer):void {
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

		var modelHandler = (model:data.IMediator, previous:data.IMediator):void => {
			// if no model has been explicitly set, notify of the parent's model change
			if (!this._model && !util.isEqual(model, previous)) {
				this._notify(model, previous, 'model');
			}
		};
		util.remove(this._parentModelHandle);
		this._parentModelHandle = parent && parent.observe('model', modelHandler);
		modelHandler(parent && parent.get('model'), previous && previous.get('model'));
	}
});

export = View;
