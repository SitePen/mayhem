import BindDirection = require('../binding/BindDirection');
import binding = require('../binding/interfaces');
import Container = require('./Container');
import core = require('../interfaces');
import has = require('../has');
import lang = require('dojo/_base/lang');
import Placeholder = require('./Placeholder');
import ui = require('./interfaces');
import util = require('../util');

class View extends Container implements ui.IView {
	/* private */ _app:core.IApplication;
	private _bindings:binding.IBindingHandle[];
	private _placeholders:{ [name:string]: ui.IPlaceholder; };

	constructor(kwArgs?:any) {
		this._bindings = [];
		this._placeholders = {};
		util.deferSetters(this, [ 'content' ], '_render');

		super(kwArgs);

		// TODO: capture IHandle for cleanup
		this.observe('mediator', (mediator:core.IMediator):void => {
			if (!mediator) { return; }
			// when the mediator changes, update any bindings
			for (var i = 0, binding:binding.IBindingHandle; (binding = this._bindings[i]); i++) {
				binding.setSource(mediator);
			}
		});
	}

	add(item:ui.IWidget, placeholder:string):IHandle;
	add(item:ui.IWidget, referenceNode:Node):IHandle;
	add(item:ui.IWidget, position?:any):IHandle;
	add(item:ui.IWidget, position?:any):IHandle {
		if (typeof position === 'string') {
			var placeholder:ui.IPlaceholder = this._placeholders[position];

			if (has('debug') && !placeholder) {
				throw new Error('Unknown placeholder "' + position + '"');
			}

			placeholder.set('widget', item);
			return {
				remove: function ():void {
					this.remove = function ():void {};
					placeholder.set('widget', null);
					placeholder = null;
				}
			};
		}
		else if (position instanceof Node) {
			this._renderer.insertAt(this, item, position);
			this.attach(item);
			this.get('children').push(item);
			
			var self = this;
			return {
				remove: function ():void {
					this.remove = function ():void {};
					self.remove(item);
					item = self = null;
				}
			};
		}
		return super.add(item, position)
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

	clear():void {
		// TODO: detach children, placeholders
		this._renderer.clear(this);
	}

	/* protected */ _contentSetter(content:Node):void {
		this._renderer.setBody(this, content);
	}

	createPlaceholder(name:string, position:Node):ui.IPlaceholder {
		if (has('debug') && this._placeholders[name]) {
			throw new Error('Widget already has a placeholder named "' + name + '"');
		}
		var placeholder = this._placeholders[name] = new Placeholder();
		this._renderer.insertAt(this, placeholder, position);
		this.attach(placeholder);
		return placeholder;
	}

	destroy():void {
		var binding:binding.IBindingHandle;
		for (var i = 0; (binding = this._bindings[i]); ++i) {
			binding.remove();
		}
		this._bindings = null;

		for (var name in this._placeholders) {
			var placeholder = this._placeholders[name];
			placeholder.empty();
			placeholder.destroy();
		}

		super.destroy();
	}

	get:ui.IViewGet;

	set:ui.IViewSet;
}

export = View;
