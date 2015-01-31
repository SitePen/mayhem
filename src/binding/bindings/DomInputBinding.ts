import binding = require('../interfaces');
import ObjectTargetBinding = require('./ObjectTargetBinding');
import on = require('dojo/on');

/**
 * Enables reactive binding to DOM input elements.
 */
class DomInputBinding<T> extends ObjectTargetBinding<T> {
	static test(kwArgs:binding.IBindingArguments):boolean {
		var object = <any> kwArgs.object;

		if (object == null) {
			return false;
		}

		// TODO: <select>? <textarea>?
		if (
			object.nodeType === /* Node.ELEMENT_NODE */ 1 &&
			(kwArgs.path === 'value' || kwArgs.path === 'checked') &&
			object.nodeName.toUpperCase() === 'INPUT'
		) {
			return true;
		}

		return false;
	}

	/**
	 * The watch handle for the bound object.
	 */
	private _handle:IHandle;

	/**
	 * The object containing the final property to be bound.
	 * @protected
	 */
	_object:HTMLInputElement;

	/**
	 * @protected
	 */
	_property:string;

	constructor(kwArgs:binding.IBindingArguments) {
		super(kwArgs);

		var object:HTMLInputElement = <any> kwArgs.object;
		var property:string = kwArgs.path;

		this._object = object;
		this._property = property;

		var self = this;
		this._handle = on(object, 'input, change, propertychange', function (event:Event):void {
			if (event.type !== 'propertychange' || (<any> event).propertyName === property) {
				self.notify({ value: (<any> event.target)[property] });
			}
		});
	}

	destroy():void {
		super.destroy();
		this._handle.remove();
		this._handle = null;
	}
}

export = DomInputBinding;
