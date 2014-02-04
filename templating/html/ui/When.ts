import core = require('../../../interfaces');
import lang = require('dojo/_base/lang');
import TemplatingWidget = require('./Widget');
import util = require('../../../util');
import widgets = require('../../../ui/interfaces');

class When extends TemplatingWidget {

	private _errorWidget:widgets.IDomWidget;
	private _finalValue:any;
	private _promiseField:string;
	private _progressWidget:widgets.IDomWidget;
	private _resolvedWidget:widgets.IDomWidget;
	private _sourceMediator:core.IMediator;
	private _valueField:string;

	constructor(kwArgs:Object) {
		util.deferSetters(this, [ 'error', 'progress', 'promise', 'resolved', 'value' ], '_render');
		super(kwArgs);
	}

	private _getSourceMediator():core.IMediator {
		if (this._sourceMediator) {
			return this._sourceMediator;
		}
		return this.parent.get('mediator');
	}

	private _createScopedMediator():core.IMediator {
		// Create a new mediator that delegates to the old one
		var options:any = {};
		options['_' + this._valueField + 'Getter'] = () => {
			// TODO: should we do something when value is not yet resolved?
			return this._finalValue;
		};
		return lang.delegate(this._getSourceMediator(), options);
	}

	private _errorSetter(node:any):void {
		this._errorWidget = this._constructWidget(node);
	}

	private _handleResolvedPromise(value:any):void {
		this._finalValue = value;
		this.set('content', this._resolvedWidget);
		// TODO: remove this hack once super._mediatorSetter fires properly on children
		this._resolvedWidget && this._resolvedWidget.set('mediator', this.mediator);
	}

	/* protected */ _mediatorSetter(mediator:core.IMediator):void {
		this._sourceMediator = mediator;
		if (this._valueField) {
			mediator = this._createScopedMediator();
		}
		super._mediatorSetter(mediator);
	}

	private _progressSetter(node:any):void {
		this._progressWidget = this._constructWidget(node);
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
		promise.then((value:any):void => {
			this._handleResolvedPromise(value);
		}, (error:any):void => {
			this._finalValue = error;
			this._errorWidget && this.set('content', this._errorWidget);
		}, (progress:any):void => {
			// TODO
			console.log('PROGRESS::', arguments)
			this._progressWidget && this.set('content', this._progressWidget);
		});
	}

	private _resolvedSetter(node:any):void {
		this._resolvedWidget = this._constructWidget(node);
	}

	private _valueSetter(field:string):void {
		this._valueField = field;
		// We have to rescope mediator when value field has changes
		this.set('mediator', this._getSourceMediator());
	}
}

export = When;
