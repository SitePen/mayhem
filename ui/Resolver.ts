/// <amd-dependency path="./renderer!Resolver" />
/// <reference path="../dojo" />

import ContentView = require('./ContentView');
import data = require('../data/interfaces');
import Mediator = require('../data/Mediator');
import ui = require('./interfaces');
import util = require('../util');
import when = require('dojo/when');

var Renderer:any = require('./renderer!Resolver');

class Resolver extends ContentView implements ui.IResolver {
	private _promiseFieldBinding:IHandle;
	_target:any;

	constructor(kwArgs?:any) {
		this._deferProperty('target', '_render');
		super(kwArgs);
	}

	get:ui.IResolverGet;
	set:ui.IResolverSet;

	add(item:ui.IWidget, position?:any):IHandle {
		// Forward view-specific calls to succcess widget
		return this.get('success').add(item, position);
	}

	destroy():void {
		// Register destroyables to be sure they're torn down
		this.own(this.get('success'), this.get('error'), this.get('during'));

		var promise = this.get('target');
		promise = promise && promise['cancel'] && promise['cancel']();

		util.destroy(this.get('scopedModel'));
		util.remove(this._promiseFieldBinding);
		this._promiseFieldBinding = null;

		super.destroy();
	}

	/* protected */ _initialize():void {
		super._initialize();

		this.observe('model', (model:data.IMediator):void => {
			this.set('scopedModel', model ? this._scopeModel(model) : null);
		});

		this.observe('scopedModel', (model:data.IMediator, previous:data.IMediator):void => {
			this._updateWidgetModels(model);
			util.destroy(previous);
		});

		// Observe widget's `promise` property and bind model's field to widget's `target` property
		this.observe('promise', (sourceBinding:string):void => {
			util.remove(this._promiseFieldBinding);
			this._promiseFieldBinding = this.bind({
				sourceBinding: sourceBinding,
				targetBinding: 'target'
			});
		});

		this.observe('phase', this._updateVisibility);
		this.observe('result', this._notifyScopedModel);
		this.observe('success', this._placeView);
		this.observe('error', this._placeView);
		this.observe('during', this._placeView);

		this.set('success', new ContentView());
	}

	private _notifyScopedModel(result:any, previous:any):void {
		var model = this.get('scopedModel');
		model && model['_notify'](result, previous, this.get('value'));
	}

	private _placeView(view:ui.IWidget, previous:ui.IWidget):void {
		if (!view && !previous) {
			return;
		}
		// Defer until rendered
		if (!this.get('rendered')) {
			this.observe('rendered', ():void => {
				this._placeView(view, previous);
			});
			return;
		}

		var index:number;
		if (previous) {
			index = previous.get('index');
			previous.destroy();
			previous = null;
		}
		view && super.add(view, index >= 0 ? index : null);
	}

	remove(index:any):void {
		// Forward view-specific calls to success widget unless we're removing one of this Resolver's widgets
		if (this.getChildIndex(index) !== -1) {
			return super.remove(index);
		}
		return this.get('success').remove(index);
	}

	private _scopeModel(model:data.IMediator):Mediator {
		var scopedModel = new Mediator({ model: model }),
			_get = scopedModel.get,
			_set = scopedModel.set;
		scopedModel.get = (name:string):any => {
			if (name === this.get('value')) {
				return this.get('result');
			}
			else {
				return _get.call(scopedModel, name);
			}
		};
		scopedModel.set = <data.IMediatorGet> ((name:string, value:any):void => {
			if (name === this.get('value')) {
				return this.set('result', value);
			}
			else {
				_set.call(scopedModel, name, value);
			}
		});
		return scopedModel;
	}

	setContent(content:any):void {
		// Forward view-specific calls to succcess widget
		this.get('success').setContent(content);
	}

	/* protected */ _targetSetter(target:any):void {
		this._target = target;
		this.set('result', undefined);
		this.set('phase', 'during');
		when(target).then((result:any):void => {
			this.set('result', result);
			this.set('phase', 'success');
		}, (error:Error):void => {
			this.set('result', error);
			this.set('phase', 'error');
		}, (progress:any):void => {
			this.set('result', progress);
		});
	}

	private _updateVisibility(current:string):void {
		var phases = [ 'during', 'error', 'success' ],
			phase:string,
			widget:ui.IWidget;
		for (var i = 0; (phase = phases[i]); ++i) {
			widget = this.get(phase);
			widget && widget.set('hidden', phase !== current);
		}
	}

	private _updateWidgetModels(model:data.IMediator):void {
		var phases = [ 'during', 'error', 'success' ],
			phase:string,
			widget:ui.IWidget;
		for (var i = 0; (phase = phases[i]); ++i) {
			widget = this.get(phase);
			widget && widget.set('model', model);
		}
	}
}

Resolver.prototype._renderer = new Renderer();

export = Resolver;
