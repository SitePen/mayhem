import core = require('../../interfaces');
import Placeholder = require('../../ui/dom/Placeholder');
import lang = require('dojo/_base/lang');
import processor = require('../html');
import ui = require('../../ui/interfaces');
import util = require('../../util');

class When extends Placeholder {
	defaultErrorWidget:ui.IDomWidget;
	defaultProgressWidget:ui.IDomWidget;
	private _errorWidget:ui.IDomWidget;
	private _finalValue:any;
	private _promiseField:string;
	private _progressWidget:ui.IDomWidget;
	private _resolvedWidget:ui.IDomWidget;
	private _scopedMediator:core.IMediator;
	private _sourceMediator:core.IMediator;
	private _valueField:string;

	constructor(kwArgs:Object) {
		util.deferSetters(this, [ 'promise' ], '_activeMediatorSetter');
		super(kwArgs);
		// TODO: this.defaultErrorWidget
		// TODO: this.defaultProgressWidget
	}

	/* protected */ _activeMediatorSetter(mediator:core.IMediator):void {
		if (this._valueField) {
			mediator = this._scopedMediator = util.createScopedMediator(mediator, this._valueField, ():any => {
				// TODO: what should we return when value is not yet resolved?
				return this._finalValue;
			});
		}
		super._activeMediatorSetter(mediator);
	}

	destroy():void {
		// TODO
		super.destroy();
	}

	private _errorSetter(node:any):void {
		this._errorWidget = processor.construct(node, { parent: this, app: this.get('app') });
	}

	private _getSourceMediator():core.IMediator {
		return this._mediator || this._parent && this._parent.get('mediator');
	}

	private _handleResolvedPromise(value:any):void {
		this._finalValue = value;
		this.set('content', this._resolvedWidget);
	}

	private _progressSetter(node:any):void {
		this._progressWidget = processor.construct(node, { parent: this, app: this.get('app') });
	}

	private _promiseSetter(field:string):void {
		this._promiseField = field;
		var promise:any = this.get('mediator').get(field);
		// If not a promise we should just set the value as content
		if (!promise || typeof promise.then !== 'function') {
			this._handleResolvedPromise(promise);
			return;
		}

		this._finalValue = undefined;
		this.set('content', this._progressWidget || this.defaultProgressWidget);

		promise.then((value:any):void => {
			this._handleResolvedPromise(value);
		}, (error:any):void => {
			this._finalValue = error;
			this._errorWidget && this.set('content', this._errorWidget);
		}, (progress:any):void => {
			// TODO
			console.log('PROGRESS::', arguments);
			this._progressWidget && this.set('content', this._progressWidget);
		});
	}

	private _resolvedSetter(node:any):void {
		this._resolvedWidget = processor.construct(node, { parent: this });
	}

	private _valueSetter(field:string):void {
		this._valueField = field;
		// We have to rescope active mediator when value field changes
		var activeMediator:core.IMediator = this._getSourceMediator();
		activeMediator && this.set('activeMediator', activeMediator);
	}
}

export = When;
