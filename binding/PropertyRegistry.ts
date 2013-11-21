/// <reference path="interfaces.ts" />

import DataBindingDirection = require('./DataBindingDirection');

/**
 * A data binding registry that uses opaque Property objects to enable binding between arbitrary properties of
 * two different objects.
 */
class PropertyRegistry implements IDataBindingRegistry {
	private _binders:IPropertyBinder[] = [];
	app:IApplication;

	constructor(kwArgs:Object) {
		this.app = kwArgs['app'];
		this._binders = kwArgs['binders'] || [];
	}

	add(Binder:IPropertyBinder, index:number = Infinity):IHandle {
		var binders = this._binders;

		binders.splice(index, 0, Binder);

		return {
			remove: function () {
				this.remove = function () {};

				for (var i = 0, OtherBinder; (OtherBinder = binders[i]); ++i) {
					if (Binder === OtherBinder) {
						binders.splice(i, 1);
						break;
					}
				}

				Binder = binders = null;
			}
		};
	}

	test(kwArgs:IDataBindingArguments):boolean {
		var sourceBindingValid = false,
			targetBindingValid = false;

		for (var i = 0, Binder; (Binder = this._binders[i]); ++i) {
			if (!sourceBindingValid && Binder.test(kwArgs.source, kwArgs.sourceBinding)) {
				sourceBindingValid = true;
			}
			if (!targetBindingValid && Binder.test(kwArgs.target, kwArgs.targetBinding)) {
				targetBindingValid = true;
			}

			if (sourceBindingValid && targetBindingValid) {
				return true;
			}
		}

		return false;
	}

	createProperty(object:Object, binding:string, options:{ scheduled?:boolean; } = {}):IBoundProperty {
		var binders = this._binders,
			app = this.app,
			registry = this;

		function scheduled(property:IBoundProperty):IBoundProperty {
			var oldSet = property.set;
			property.set = function (value:any):void {
				var self = this,
					args = arguments;

				app.scheduler.schedule(property.id, value === property.get() ? null : function () {
					oldSet.apply(self, args);
				});
			};
			return property;
		}

		var property:IBoundProperty;
		for (var i = 0, Binder:IPropertyBinder; (Binder = binders[i]); ++i) {
			if (Binder.test({ object: object, binding: binding, registry: this })) {
				var property = new Binder({
					object: object,
					binding: binding,
					registry: this
				});

				return options.scheduled === false ? property : scheduled(property);
			}
		}

		// TODO: Use BindingError
		throw new Error('No registered property binders understand the requested binding');
	}

	bind(kwArgs:IDataBindingArguments):IHandle {
		var source = this.createProperty(kwArgs.source, kwArgs.sourceBinding),
			target = this.createProperty(kwArgs.target, kwArgs.targetBinding);

		source.bindTo(target);

		if (kwArgs.direction === DataBindingDirection.TWO_WAY) {
			target.bindTo(source);
		}

		return {
			remove: function () {
				this.remove = function () {};
				source.destroy();
				target.destroy();
				source = target = null;
			}
		};
	}
}

export = PropertyRegistry;
