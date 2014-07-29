/// <reference path="../../dojo" />

import binding = require('../interfaces');
import Binding = require('../Binding');
import core = require('../../interfaces');
import lang = require('dojo/_base/lang');
import Observable = require('../../Observable');
import util = require('../../util');

var SEPARATOR:string = '%';

/**
 * This property binder adds the ability to bind to metadata properties on instances of classes such as data/Model.
 */
class MetadataBinding<T> extends Binding<T, T> implements binding.IBinding<T, T> {
	static test(kwArgs:binding.IBindingArguments):boolean {
		var object = <core.IHasMetadata> kwArgs.object;
		return object != null && typeof object.getMetadata === 'function' && kwArgs.path &&
			util.escapedIndexOf(kwArgs.path, SEPARATOR) > -1;
	}

	private _source:binding.IBinding<T, T>;
	private _target:binding.IBinding<T, T>;

	// TODO: this should pass the main binding string on to another Binding
	constructor(kwArgs:binding.IBindingArguments) {
		super(kwArgs);

		var path:string = kwArgs.path;
		var splitPath:string[] = util.escapedSplit(path, SEPARATOR);

		var property:string = splitPath[0];
		var metadataProperty:string = splitPath.slice(1).join(SEPARATOR);

		var metadata:core.IObservable = (<core.IHasMetadata> kwArgs.object).getMetadata(property);

		this._source = kwArgs.binder.createBinding<T, T>(metadata, metadataProperty, { scheduled: false });

		var self = this;
		this._source.bindTo(<binding.IBinding<T, T>> {
			set: function (value:T):void {
				self._target && self._target.set(value);
			}
		});
	}

	bindTo(target:binding.IBinding<T, T>, options:binding.IBindToOptions = {}):IHandle {
		this._target = target;

		if (!target) {
			return;
		}

		if (options.setValue !== false) {
			target.set(this.get());
		}

		var self = this;
		return {
			remove: function ():void {
				this.remove = function ():void {};
				self = self._target = null;
			}
		};
	}

	destroy():void {
		super.destroy();

		this._source && this._source.destroy();
		this._source = this._target = null;
	}

	get():T {
		return this._source ? this._source.get() : undefined;
	}

	set(value:T):void {
		this._source && this._source.set(value);
	}
}

export = MetadataBinding;
