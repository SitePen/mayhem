import binding = require('./interfaces');
import core = require('../interfaces');
import has = require('../has');
import util = require('../util');

var Node:Node;
if (has('dom-addeventlistener')) {
	Node = (<any> window).Node;
}
else {
	Node = <any> {
		ELEMENT_NODE: 1,
		ATTRIBUTE_NODE: 2,
		TEXT_NODE: 3,
		COMMENT_NODE: 8,
		DOCUMENT_NODE: 9,
		DOCUMENT_FRAGMENT_NODE: 11
	};
}

if (!has('dom-textnode-extensible')) {
	var textNodes:{ object:{}; id:number; }[] = [];
	var checkIsExpandable = function (object:{ nodeType?:number; }):boolean {
		return !object.nodeType || (object.nodeType !== Node.ATTRIBUTE_NODE && object.nodeType !== Node.TEXT_NODE);
	};
}

// `oidKey` intentionally uses a unique string so that it is easily discoverable within the source code for anyone
// that notices the property appearing on their objects. Please don't be clever and try to save memory by reducing it
// TODO: Two applications on one page using the same copy of Mayhem, binding to the same object, will break.
var oidKey:string = '__BindingOid' + String(Math.random()).slice(2);
var oid:number = 0;

/**
 * The BindingProxty class is the base class for all property binder implementations.
 *
 * @abstract
 */
class Binding<SourceT, TargetT> {
	private _observers:core.IObserver<TargetT>[];

	/**
	 * The identifier for this binding. Binding on the same object property will have the same identifier.
	 */
	id:string;

	private _textNode:{};

	/**
	 * Determines whether or not this binding constructor can be used to create a binding using the provided binding
	 * arguments.
	 *
	 * @memberof module:mayhem/binding/Binding
	 * @member test
	 * @method
	 */

	constructor(kwArgs:binding.IBindingArguments) {
		var object = <HashMap<any>> kwArgs.object;
		var id:number;

		// The objects being bound to needs to be able to be persistently uniquely identified in order to debounce
		// multiple changes to properties within the scheduler. Since EcmaScript provides no mechanism for getting a
		// unique serialized object ID, this does the next best thing and generates a unique-per-page identifier that
		// is attached to the object as quietly as possible
		if (object[oidKey]) {
			id = object[oidKey];
		}
		else {
			if (has('es5')) {
				id = ++oid;
				Object.defineProperty(object, oidKey, {
					value: id,
					configurable: true
				});
			}
			else if (!has('dom-textnode-extensible') && checkIsExpandable(object)) {
				id = object[oidKey] = (++oid);
			}
			else {
				this._textNode = object;
				id = (function ():number {
					for (var i = 0, j = textNodes.length; i < j; ++i) {
						if (textNodes[i].object === object) {
							return textNodes[i].id;
						}
					}

					var id:number = ++oid;
					textNodes.push({ object: object, id: id });
					return id;
				})();
			}
		}

		this.id = 'Binding' + id + '/' + kwArgs.path;
		this._observers = [];
	}

	destroy():void {
		this.destroy = function ():void {};

		if (!has('dom-textnode-extensible') && this._textNode) {
			for (var i = 0, j = textNodes.length; i < j; ++i) {
				if (textNodes[i].object === this._textNode) {
					textNodes.splice(i, 1);
					break;
				}
			}

			this._textNode = null;
		}
	}

	/**
	 * Sets the target property to bind to. The target will have its value reset immediately upon binding.
	 *
	 * @memberof module:mayhem/binding/Binding#
	 * @member bindTo
	 * @method
	 */

	/**
	 * Destroys the binding.
	 *
	 * @memberof module:mayhem/binding/Binding#
	 * @member destroy
	 * @method
	 */

	/**
	 * Gets the current value of the bound property.
	 *
	 * @memberof module:mayhem/binding/Binding#
	 * @member get
	 * @method
	 */

	/**
	 * Sets the value of this property. This is intended to be used to update the value of this property from another
	 * bound property and so will not be propagated to the target object, if one exists.
	 *
	 * @memberof module:mayhem/binding/Binding#
	 * @member set
	 * @method
	 */

	private _notifyObservers(newValue:TargetT, oldValue:TargetT):void {
		for (var i = 0, observer:core.IObserver<TargetT>; (observer = this._observers[i]); ++i) {
			observer(newValue, oldValue);
		}
	}

	get():TargetT {
		throw new Error('Unimplemented');
	}

	// TODO: Provide real implementation
	observe(observer:core.IObserver<TargetT>, invokeImmediately:boolean = true):IHandle {
		this._observers.push(observer);

		if (invokeImmediately) {
			observer(this.get(), undefined);
		}

		var self = this;
		return {
			remove: function ():void {
				this.remove = function ():void {};
				util.spliceMatch(self._observers, observer);
				self = observer = null;
			}
		};
	}
}

export = Binding;
