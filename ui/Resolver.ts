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

	add(item:ui.IWidget, position?:any):IHandle {
		// Forward add calls to success widget
		return this.get('success').add(item, position);
	}

	/* protected */ _contentSetter(content:any):void {
		// Forward content set calls to success widget
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
		// TODO: cancel this._values.target if it's a promise
		this._promiseFieldBinding = util.remove(this._promiseFieldBinding) && null;
		this._scopedMediator = util.destroy(this._scopedMediator) && null;
		// TODO: the rest...
		super.destroy();
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
			// TODO
			// // Bail if we've already processed a value and this is the same one
			// if (this.get('content') !== undefined && target === previous) {
			// 	return;
			// }
			// // // Bail if we've already successfully processed a value and new value isn't a promise
			// var success = this.get('content') === this.get('success');
			// if (success && (!target || typeof target['then'] !== 'function')) {
			// 	return;
			// }
			
			this.set('result', undefined);
			this._setContent('during');
			when(target).then((result:any):void => {
				this.set('result', result);
				this._setContent('success');
			}, (error:Error):void => {
				this.set('result', error);
				this._setContent('error');
			}, (progress:any):void => {
				this.set('result', progress);
			});
		});
	}

	private _setContent(type:string):void {
		// Set placeholder content directly
		super._contentSetter(this.get(type));
	}
}

Resolver.prototype._renderer = new Renderer();

export = Resolver;
