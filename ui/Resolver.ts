/// <amd-dependency path="./renderer!Resolver" />

import data = require('../data/interfaces');
import Mediator = require('../data/Mediator');
import Placeholder = require('./Placeholder');
import ui = require('./interfaces');
import util = require('../util');
import View = require('./View');
import when = require('dojo/when');

var Renderer:any = require('./renderer!Resolver');

class Resolver extends Placeholder implements ui.IResolver {
	private _promiseFieldBinding:IHandle;
	private _scopedMediator:Mediator;
	private _sourceMediator:data.IMediator;
	/* protected */ _values:ui.IResolverValues;

	get:ui.IResolverGet;
	set:ui.IResolverSet;

	// Forward add calls to success widget
	add(item:ui.IWidget, position?:any):IHandle {
		return this.get('success').add(item, position);
	}

	// Forward set content calls to success widget
	/* protected */ _contentSetter(content:any):void {
		this.get('success').set('content', content);
	}

	private _createScopedMediator(mediator:data.IMediator):Mediator {
		this._scopedMediator && this._scopedMediator.destroy();
		var scopedMediator = this._scopedMediator = new Mediator({ model: mediator }),
			_get = scopedMediator.get,
			_set = scopedMediator.set;
		scopedMediator.get = (name:string):any => {
			if (name === this.get('value')) {
				return this.get('result');
			}
			else {
				return _get.call(scopedMediator, name);
			}
		}
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

	destroy():void {
		// Register destroyables to be sure they're torn down
		this.own(this.get('success'), this.get('error'), this.get('during'));
		
		var promise = this.get('target');
		promise = promise && promise['cancel'] && promise['cancel']();

		util.remove(this._promiseFieldBinding);
		util.remove(this._scopedMediator);
		this._promiseFieldBinding = this._scopedMediator = this._sourceMediator = null;

		super.destroy();
	}

	detach():void {
		this.get('success').detach();
		super.detach();
	}

	/* protected */ _initialize():void {
		super._initialize();

		this.set('success', new View());

		this.observe('mediator', (mediator:data.IMediator):void => {
			if (!mediator) {
				// TODO: what's the right thing to do here?
				return;
			}
			util.destroy(this._scopedMediator);
			this._sourceMediator = mediator;
			this._scopedMediator = this._createScopedMediator(mediator);
			// Call promise setter again to get a new promise field observer
		});

		this.observe('result', (result:any, previous:any):void => {
			this._scopedMediator && this._scopedMediator['_notify'](result, previous, this.get('value'));
		});

		// Observe widget's `promise` property and bind mediator's field to widget's `target` property
		this.observe('promise', (sourceBinding:string):void => {
			util.remove(this._promiseFieldBinding);
			this._promiseFieldBinding = this.bind({
				sourceBinding: sourceBinding,
				targetBinding: 'target'
			});
		});

		// Watch target for promise to resolve
		this.observe('target', (target:any, previous:any):void => {
			this.set('result', undefined);
			this.set('widget', this.get('during'));
			when(target).then((result:any):void => {
				this.set('result', result);
				this.set('widget', this.get('success'));
			}, (error:Error):void => {
				this.set('result', error);
				this.set('widget', this.get('error'));
			}, (progress:any):void => {
				this.set('result', progress);
			});
		});
	}
}

Resolver.prototype._renderer = new Renderer();

export = Resolver;
