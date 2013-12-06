import core = require('../interfaces');
import binding = require('./interfaces');
import DataBindingDirection = require('./DataBindingDirection');

/**
 * A data binding registry that uses opaque Property objects to enable binding between arbitrary properties of
 * two different objects.
 */
class PropertyRegistry implements binding.IPropertyRegistry {
	private _binders:binding.IPropertyBinder[] = [];
	app:core.IApplication;

	constructor(kwArgs:{ app:core.IApplication; binders?:binding.IPropertyBinder[]; }) {
		this.app = kwArgs.app;
		this._binders = kwArgs.binders || [];
	}

	add(Binder:binding.IPropertyBinder, index:number = Infinity):IHandle {
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

	test(kwArgs:binding.IDataBindingArguments):boolean {
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

	createProperty(object:Object, binding:string, options:{ scheduled?:boolean; } = {}):binding.IBoundProperty {
		var binders = this._binders,
			app = this.app,
			registry = this;

		function scheduled(property:binding.IBoundProperty):binding.IBoundProperty {
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

		var property:binding.IBoundProperty;
		for (var i = 0, Binder:binding.IPropertyBinder; (Binder = binders[i]); ++i) {
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

	bind(kwArgs:binding.IDataBindingArguments):binding.IBindingHandle {
		var source = this.createProperty(kwArgs.source, kwArgs.sourceBinding),
			target = this.createProperty(kwArgs.target, kwArgs.targetBinding);

		source.bindTo(target);

		if (kwArgs.direction === DataBindingDirection.TWO_WAY) {
			target.bindTo(source);
		}

		return {
			// TODO: For ES5, use getters/setters
			setSource: (newSource:Object, newSourceBinding:string = kwArgs.sourceBinding):void => {
				source.destroy();
				source = this.createProperty(newSource, newSourceBinding);
				source.bindTo(target);
				if (kwArgs.direction === DataBindingDirection.TWO_WAY) {
					target.bindTo(source);
				}
			},
			setTarget: (newTarget:Object, newTargetBinding:string = kwArgs.targetBinding):void => {
				target.destroy();
				target = this.createProperty(newTarget, newTargetBinding);
				source.bindTo(target);
				if (kwArgs.direction === DataBindingDirection.TWO_WAY) {
					target.bindTo(source);
				}
			},
			setDirection: (newDirection:DataBindingDirection):void => {
				target.bindTo(kwArgs.direction === DataBindingDirection.TWO_WAY ? source : null);
			},
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
