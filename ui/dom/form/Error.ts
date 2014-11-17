import binding = require('../../../binding/interfaces');
import MultiNodeWidget = require('../MultiNodeWidget');
import IError = require('../../form/Error');
import lang = require('dojo/_base/lang');
import domConstruct = require('dojo/dom-construct');

class ErrorWidget extends MultiNodeWidget implements IError {
	get:ErrorWidget.Getters;
	on:ErrorWidget.Events;
	set:ErrorWidget.Setters;

	/**
	 * @get
	 * @set
	 * @protected
	 */
	_errors:Error[];

	/**
	 * @get
	 * @set
	 * @protected
	 */
	_prefix:string;

	_prefixNode:HTMLElement;
	_errorsNode:HTMLElement;
	_binding:binding.IBinding<{}>;

	destroy():void {
		this._unbindErrors();
		super.destroy();
	}

	_errorsGetter():Error[] {
		return this._errors;
	}
	_errorsSetter(errors:Error[]):void {
		this._errors = errors;

		if (this.get('isAttached')) {
			this._bindErrors();
		}
	}

	_prefixGetter():string {
		return this._prefix;
	}
	_prefixSetter(prefix:string):void {
		this._prefix = prefix;

		if (this._prefixNode) {
			this._prefixNode.innerHTML = prefix;
		}
	}

	_isAttachedGetter():boolean {
		return this._isAttached;
	}
	_isAttachedSetter(value:boolean):void {
		this._isAttached = value;

		if (value) {
			this._bindErrors();
		}
		else {
			this._unbindErrors();
		}
	}

	_bindErrors():void {
		var errors = this.get('errors');

		this._unbindErrors();
		this._updateUi();

		if (errors) {
			this._binding = this._app.get('binder').createBinding(errors, '*');
			this._binding.observe(lang.hitch(this, '_onChangeErrors'));
		}
	}

	_unbindErrors():void {
		this._binding && this._binding.destroy();
	}

	_render():void {
		super._render();

		this._prefixNode = <HTMLElement> domConstruct.create('p', {
			innerHTML: this._prefix || ''
		}, this._lastNode, 'before');

		this._errorsNode = <HTMLElement> domConstruct.create('ul', {
			className: 'errorList'
		}, this._prefixNode, 'after');
	}

	_updateUi():void {
		var prefix:string = this.get('prefix');
		var errors:Error[] = this.get('errors');
		var fragment:DocumentFragment;

		this._prefixNode.innerHTML = prefix || '';
		this._errorsNode.innerHTML = '';

		if (errors && errors.length) {
			this._onChangeErrors({
				index: 0,
				added: errors,
				removed: []
			});
		}
	}

	_onChangeErrors(change:binding.IChangeRecord<Error>):void {
		var listNode = this._errorsNode;

		if (change.removed) {
			var numRemoved = change.removed.length;

			while (numRemoved--) {
				listNode.removeChild(listNode.children[change.index]);
			}
		}

		if (change.added) {
			var fragment = document.createDocumentFragment();
			var error:Error;

			for (var i = 0; i < change.added.length; ++i) {
				error = change.added[i];
				domConstruct.create('li', {
					innerHTML: error.toString()
				}, fragment);
			}

			listNode.insertBefore(fragment, listNode.children[change.index]);
		}
	}
}

module ErrorWidget {
	export interface Events extends MultiNodeWidget.Events, IError.Events {}
	// TODO: interface combinations are resulting in TS thinking 'get' returns void
	export interface Getters extends /*MultiNodeWidget.Getters,*/ IError.Getters {}
	export interface Setters extends MultiNodeWidget.Setters, IError.Setters {}
}

export = ErrorWidget;
