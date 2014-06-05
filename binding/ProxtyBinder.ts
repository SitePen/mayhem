/// <reference path="../dojo" />

import aspect = require('dojo/aspect');
import BindDirection = require('./BindDirection');
import binding = require('./interfaces');
import BindingError = require('./BindingError');
import core = require('../interfaces');
import Deferred = require('dojo/Deferred');
import Proxty = require('../Proxty');
import util = require('../util');
import whenAll = require('dojo/promise/all');

/**
 * A data binder that uses Proxty objects to enable binding between arbitrary properties of two different objects.
 */
class ProxtyBinder implements binding.IProxtyBinder {
	// For now _app has to be exposed for testing purposes
	/* private */ _app:core.IApplication;
	private _proxties:binding.IProxtyConstructor[];
	private _useScheduler:boolean;

	constructor(kwArgs:{ app:core.IApplication; proxties?:binding.IProxtyConstructor[]; useScheduler?:boolean; }) {
		this._app = kwArgs.app;
		this._proxties = kwArgs.proxties || [];
		this._useScheduler = kwArgs.useScheduler != null ? kwArgs.useScheduler : true;
	}

	add(Ctor:binding.IProxtyConstructor, index:number = Infinity):IHandle {
		var proxties = this._proxties;

		proxties.splice(index, 0, Ctor);

		return {
			remove: function ():void {
				this.remove = function ():void {};

				for (var i = 0, OtherCtor:binding.IProxtyConstructor; (OtherCtor = proxties[i]); ++i) {
					if (Ctor === OtherCtor) {
						proxties.splice(i, 1);
						break;
					}
				}

				Ctor = proxties = null;
			}
		};
	}

	bind<SourceT, TargetT>(kwArgs:binding.IBindArguments):binding.IBindingHandle {
		// For source or target, if binding is provided use it to create proxty, otherwise it should already be a proxty
		var source:binding.IProxty<SourceT, TargetT>,
			target:binding.IProxty<TargetT, SourceT>;
		if (kwArgs.sourceBinding) {
			source = this.createProxty<SourceT, TargetT>(kwArgs.source, kwArgs.sourceBinding, { scheduled: this._useScheduler });
		}
		else {
			source = <binding.IProxty<SourceT, TargetT>> kwArgs.source;
		}
		if (kwArgs.sourceBinding) {
			target = this.createProxty<TargetT, SourceT>(kwArgs.target, kwArgs.targetBinding, { scheduled: this._useScheduler });
		}
		else {
			target = <binding.IProxty<TargetT, SourceT>> kwArgs.target;
		}
		
		source.bindTo(target);

		if (kwArgs.direction === BindDirection.TWO_WAY) {
			target.bindTo(source, { setValue: false });
		}

		return {
			setSource: (newSource:Object, newSourceBinding:string = kwArgs.sourceBinding):void => {
				source.destroy();
				source = this.createProxty<SourceT, TargetT>(newSource, newSourceBinding, { scheduled: this._useScheduler });
				source.bindTo(target);
				if (kwArgs.direction === BindDirection.TWO_WAY) {
					target.bindTo(source, { setValue: false });
				}
			},
			setTarget: (newTarget:Object, newTargetBinding:string = kwArgs.targetBinding):void => {
				target.destroy();
				target = this.createProxty<TargetT, SourceT>(newTarget, newTargetBinding, { scheduled: this._useScheduler });
				source.bindTo(target);
				if (kwArgs.direction === BindDirection.TWO_WAY) {
					target.bindTo(source, { setValue: false });
				}
			},
			setDirection: (newDirection:BindDirection):void => {
				target.bindTo(newDirection === BindDirection.TWO_WAY ? source : null);
			},
			remove: function ():void {
				this.remove = function ():void {};
				source.destroy();
				target.destroy();
				source = target = null;
			}
		};
	}

	createProxty<SourceT, TargetT>(object:Object, binding:string, options:{ scheduled?:boolean; } = {}):binding.IProxty<SourceT, TargetT> {
		var proxties = this._proxties,
			app = this._app,
			binder = this;

		function scheduled(proxty:binding.IProxty<SourceT, TargetT>):binding.IProxty<SourceT, TargetT> {
			var oldSet = proxty.set;
			proxty.set = function (value:SourceT):void {
				var self = this,
					args = arguments,
					schedule = util.isArray(value) || value !== proxty.get();

				app.get('scheduler').schedule(proxty.id, schedule ? function ():void {
					oldSet.apply(self, args);
				} : null);
			};
			return proxty;
		}

		var proxty:binding.IProxty<SourceT, TargetT>;
		for (var i = 0, Proxty:binding.IProxtyConstructor; (Proxty = proxties[i]); ++i) {
			if (Proxty.test({ object: object, binding: binding, binder: this })) {
				proxty = new Proxty<SourceT, TargetT>({
					object: object,
					binding: binding,
					binder: this
				});

				return options.scheduled === false ? proxty : scheduled(proxty);
			}
		}

		throw new BindingError(
			'No registered proxty constructors understand the requested binding "{binding}" on {object}.', {
				object: object,
				binding: binding,
				binder: this
			}
		);
	}

	/**
	 * Return a Proxty that is bound to a particular metadata key on an object.
	 *
	 * @param object Object with metadata
	 * @param binding Metadata key, or hierarchical key specifier, to bind to
	 * @param field Specific field in metadata object to observe
	 */
	getMetadata<T>(object:Object, binding:string, field:string):core.IProxty<T>;
	getMetadata(object:Object, binding:string):core.IProxty<core.IObservable>;
	getMetadata(object:Object, binding:string, field?:string):core.IProxty<any> {
		var metadata:core.IProxty<any> = new Proxty(null),
			metadataHandle:IHandle;

		function swapMetadataObject(newObject:core.IHasMetadata):void {
			var newMetadata:core.IObservable = newObject && newObject.getMetadata ? newObject.getMetadata(key) : null;

			if (field) {
				metadataHandle && metadataHandle.remove();

				if (newMetadata) {
					metadataHandle = newMetadata.observe(field, function (newValue:any):void {
						metadata.set(newValue);
					});

					metadata.set(newMetadata.get(field));
				}
				else {
					metadata.set(null);
				}
			}
			else {
				metadata.set(newMetadata);
			}
		}

		var splitAt:number = binding.lastIndexOf('.'),
			key:string;

		// Getting metadata is like getting a property descriptor; we need to have a reference to the parent object
		// of the key, and the key, in order to look it up
		if (splitAt > -1) {
			key = binding.slice(splitAt + 1);
			binding = binding.slice(0, splitAt);
		}
		else {
			key = binding;
			binding = '';
		}

		if (binding) {
			var parentProxty = this.createProxty(object, binding);
			// TODO: should we be keeping track of this observer handle?
			parentProxty.observe(swapMetadataObject);
		}
		else {
			swapMetadataObject(<core.IHasMetadata> object);
		}

		aspect.after(metadata, 'destroy', function ():void {
			metadataHandle && metadataHandle.remove();
			parentProxty && parentProxty.destroy();
			metadataHandle = parentProxty = null;
		}, true);

		return metadata;
	}

	startup():IPromise<any[]> {
		// This is needed because proxties can be set up in the configuration of the app
		var proxties = this._proxties;

		function loadProxty(index:number, moduleId:string):IPromise<void> {
			var dfd:IDeferred<void> = new Deferred<void>();

			require([ moduleId ], function (Proxty:binding.IProxtyConstructor):void {
				proxties.splice(index, 1, Proxty);
				dfd.resolve(null);
			});

			return dfd.promise;
		}

		var promises:IPromise<void>[] = [];

		for (var i = 0, proxtyCtor:any; (proxtyCtor = this._proxties[i]); ++i) {
			if (typeof proxtyCtor === 'string') {
				promises.push(loadProxty(i, proxtyCtor));
			}
		}

		return whenAll(promises);
	}

	test(kwArgs:binding.IBindArguments):boolean {
		var sourceBindingValid = false,
			targetBindingValid = false;

		for (var i = 0, Proxty:binding.IProxtyConstructor; (Proxty = this._proxties[i]); ++i) {
			if (!sourceBindingValid && Proxty.test({
				object: kwArgs.source,
				binding: kwArgs.sourceBinding,
				binder: this
			})) {
				sourceBindingValid = true;
			}

			if (!targetBindingValid && Proxty.test({
				object: kwArgs.target,
				binding: kwArgs.targetBinding,
				binder: this
			})) {
				targetBindingValid = true;
			}

			if (sourceBindingValid && targetBindingValid) {
				return true;
			}
		}

		return false;
	}
}

export = ProxtyBinder;
