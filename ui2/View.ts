import BindDirection = require('../binding/BindDirection');
import binding = require('../binding/interfaces');
import core = require('../interfaces');
import lang = require('dojo/_base/lang');
import ui = require('./interfaces');
import util = require('../util');
import Container = require('./Container');

class View extends Container implements ui.IView {
	/* private */ _app:core.IApplication;
	private _bindings:binding.IBindingHandle[];

	get:ui.IViewGet;
	set:ui.IViewSet;

	constructor(kwArgs:Object = {}) {
		this._bindings = [];

		super(kwArgs);

		this.observe('mediator', (mediator:core.IMediator):void => {
			if (!mediator) { return; }
			// when the mediator changes, update any bindings
			for (var i = 0, binding:binding.IBindingHandle; (binding = this._bindings[i]); i++) {
				binding.setSource(mediator);
			}
		});
	}

	/* protected */ _bind(kwArgs:ui.IBindArguments):binding.IBindingHandle {
		return this.get('app').get('binder').bind({
			source: this.get('mediator'),
			sourceBinding: kwArgs.sourceBinding,
			target: kwArgs.target,
			targetBinding: kwArgs.targetBinding,
			direction: BindDirection[kwArgs.twoWay ? 'TWO_WAY' : 'ONE_WAY']
		});
	}

	bind(kwArgs:ui.IBindArguments):IHandle {
		kwArgs = lang.mixin(<any>{}, kwArgs);

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
}

export = View;
