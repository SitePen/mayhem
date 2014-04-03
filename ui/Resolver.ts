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

		util.destroy(this.get('scopedMediator'));
		util.remove(this._promiseFieldBinding);
		this._promiseFieldBinding = null;

		super.destroy();
	}

	/* protected */ _initialize():void {
		super._initialize();

		this.observe('mediator', (mediator:data.IMediator):void => {
			this.set('scopedMediator', mediator ? this._scopeMediator(mediator) : null);
		});

		this.observe('scopedMediator', (mediator:data.IMediator, previous:data.IMediator):void => {
			this._updateWidgetMediators(mediator);
			util.destroy(previous);
		});

		// Observe widget's `promise` property and bind mediator's field to widget's `target` property
		this.observe('promise', (sourceBinding:string):void => {
			util.remove(this._promiseFieldBinding);
			this._promiseFieldBinding = this.bind({
				sourceBinding: sourceBinding,
				targetBinding: 'target'
			});
		});

		this.observe('phase', this._updateVisibility);
		this.observe('result', this._notifyScopedMediator);
		this.observe('success', this._placeView);
		this.observe('error', this._placeView);
		this.observe('during', this._placeView);

		this.set('success', new ContentView());
	}

	private _notifyScopedMediator(result:any, previous:any):void {
		var mediator = this.get('scopedMediator');
		mediator && mediator['_notify'](result, previous, this.get('value'));
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

	private _scopeMediator(mediator:data.IMediator):Mediator {
		var scopedMediator = new Mediator({ model: mediator }),
			_get = scopedMediator.get,
			_set = scopedMediator.set;
		scopedMediator.get = (name:string):any => {
			if (name === this.get('value')) {
				return this.get('result');
			}
			else {
				return _get.call(scopedMediator, name);
			}
		};
		scopedMediator.set = <data.IMediatorGet> ((name:string, value:any):void => {
			if (name === this.get('value')) {
				return this.set('result', value);
			}
			else {
				_set.call(scopedMediator, name, value);
			}
		});
		return scopedMediator;
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
			widget && widget.set('visible', phase === current);
		}
	}

	private _updateWidgetMediators(mediator:data.IMediator):void {
		var phases = [ 'during', 'error', 'success' ],
			phase:string,
			widget:ui.IWidget;
		for (var i = 0; (phase = phases[i]); ++i) {
			widget = this.get(phase);
			widget && widget.set('mediator', mediator);
		}
	}
}

Resolver.prototype._renderer = new Renderer();

export = Resolver;
