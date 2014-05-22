/// <reference path="../dojo" />

import array = require('dojo/_base/array');
import aspect = require('dojo/aspect');
import ClassList = require('./style/ClassList');
import core = require('../interfaces');
import has = require('../has');
import ObservableEvented = require('../ObservableEvented');
import PlacePosition = require('./PlacePosition');
import Style = require('./style/Style');
import ui = require('./interfaces');
import util = require('../util');
import when = require('dojo/when');

/**
 * A module representing a Widget
 */

var registry:{ [id:string]:ui.IWidget } = {},
	uid = 0;

if (has('debug')) {
	(<any> window).__widgets = registry;
}

/**
 * The Widget is the basic unit of the Mayhem user interface.
 * @class Widget
 * @extends  ObservableEvented
 * @implements IWidget
 * @property {string} className - A class name for the widget.
 * @property {style/ClassList} classList - Maintains a list of class names.
 * @property {style/Style} style - Maintains widget style values.
 * @property {IWidgetGet} get - getters for accessing protected widget properties.
 * @property {IWidgetSet} set - setters for accessing protected widget properties.
 * @property {string} _id - protected unique widget id.
 * @property {number} _index - protected the index of the widget within its siblings.
 * @property {IWidget} _next - protected the next sibling widget.
 * @property {IContainer} _parent - protected the parent widget or container.
 * @property {IWidget} _previous - protected the previous sibling widget.
 * @property {IRenderer} _renderer - protected the widget renderer.
 *
 */
class Widget extends ObservableEvented implements ui.IWidget {

	/**
	 * Looks up a widget instance by id.
	 * @name Widget.byId
	 * @function
	 * @param {string} id - The widget id
	 * @return {Widget} - Widget instance
	 */
	static byId(id:string):ui.IWidget {
		return registry[id];
	}

	className:string;
	classList:ClassList;
	style:Style;
	get:ui.IWidgetGet;
	set:ui.IWidgetSet;

	/**
	 * The unique widget id.
	 * @protected
	 */
	_id:string;


	/**
	 * The index of the widget within its siblings.
	 * @protected
	 */
	_index:number;

	/**
	 * The next sibling widget.
	 * @protected
	 */
	_next:ui.IWidget;

	/**
	 * The parent container or widget.
	 * @protected
	 */
	_parent:ui.IContainer;

	/**
	 * The previous sibling widget.
	 * @protected
	 */
	_previous:ui.IWidget;

	/**
	 * The widget renderer.
	 * @protected
	 */
	_renderer:ui.IRenderer;

	/**
	 * A list of event handle objects.
	 * @private
	 */
	private _ownHandles:any[]; // Array<core.IDestroyable | IHandle>

	/**
	* Creates a widget instance.
	* @constructor
	* @class Widget
	* @param {Object} kwArgs - keyword arguments
	*/
	constructor(kwArgs:any = {}) {
		this._deferProperty('hidden', '_render');
		this._deferProperty('role', '_render');
		this._ownHandles = [];

		// Capture id as provided before transforming
		var id = kwArgs.id || (kwArgs.id = 'Widget' + (++uid));

		// TODO: check registry for duplicate id and throw?
		registry[id] = this;

		super(kwArgs);
		this._render();
	}

	/**
	 * Reset a widget's classList, incorporating in existing widget and renderer
	 * classNames.
	 * @name Widget#_classSetter
	 * @function
	 * @protected
	 * @param {object} - class list object
	 */
	_classSetter(value:any):void {

		var classes:any = [];
		this.className && classes.push(this.className);
		this._renderer.className && classes.push(this._renderer.className);

		this.classList.add(classes.concat(ClassList.parse(value)).join(' '));
	}

	/**
	 * Returns the whole class list, not just the bits explicitly set on class.
	 * @name Widget#_classGetter
	 * @function
	 * @private
	 */
	private _classNameGetter():string {
		return this.classList.get();
	}

	/**
	 * Sets the class list completely, overriding className defined by widget or renderer.
	 * @name Widget#_classNameSetter
	 * @function
	 * @private
	 * @param {string} value - widget class name
	 */
	private _classNameSetter(value:string):void {
		this.classList.set(value);
	}

	/**
	 * Defers the setting of a given property until the specified method is called.
	 * @name Widget#_deferProperty
	 * @function
	 * @protected
	 * @param {string} name - property name.
	 * @param {{Array.<string>}} utilMethods - method names.
	 */
	_deferProperty(name:string, ...untilMethods:string[]):void {
		var setterName = '_' + name + 'Setter',
			originalSetter:any = this[setterName],
			outstandingMethods = untilMethods.length,
			values:any[] = [];

		this[setterName] = (value:any):void => {
			values.push(value);
		};

		var untilHandles:IHandle[] = array.map(untilMethods, (method:string, i:number):IHandle => {
			return aspect.after(this, method, ():void => {
				untilHandles[i].remove();
				if (!--outstandingMethods) {
					untilHandles = null;

					if (originalSetter) {
						this[setterName] = originalSetter;
					}
					else {
						delete this[setterName];

					}

					// Only use last value (for now)
					values.length && this.set(name, values.pop());
					values = null;
				}
			});
		});
	}

	/**
	 * Clean up references and destroy widget.
	 * @public
	 * @name Widget#destroy
	 * @function
	 */
	destroy():void {
		this.detach();
		this._renderer.destroy(this);

		// Clean up any handles and destroyables we own
		var handles = this._ownHandles;
		for (var i = 0, len = handles.length; i < len; ++i) {
			var handle = handles[i];
			if (handle && handle['destroy']) {
				util.destroy(handle);
			}
			else if (handle && handle['remove']) {
				util.remove(handle);
			}
		}
		this._ownHandles = handles = handle = null;

		registry[this.get('id')] = null;
		super.destroy();
	}

	/**
	 * Remove widget from the parent.
	 * @public
	 * @name Widget#detach
	 * @function
	 */
	detach():void {
		var parent = this.get('parent');
		parent && parent.remove(this);
	}

	/**
	 * Remove given handles from list of widget handles.
	 * @public
	 * @name Widget#disown
	 * @function
	 * @param {array} handles - list of handles to remove
	 */
	disown(...handles:any[]):void {
		var owned = this._ownHandles,
			handle:any;
		for (var i = 0, len = handles.length; i < len; ++i) {
			handle = handles[i];
			// List of owned handles is a set
			if (handle && array.indexOf(owned, handle) !== -1) {
				util.spliceMatch(owned, handle);
			}
		}
	}

	/**
	 * Invoke the event handler on the model and emit the event.
	 * @public
	 * @name Widget#emit
	 * @function
	 * @param {event} event
	 * @returns {boolean}
	 */
	emit(event:core.IEvent):boolean {
		var methodName = this._getEventedMethodName(event.type),
			handlerName:string = this.get(methodName);

		event.currentTarget = this;

		if (handlerName) {
			var model = this.get('model');

			if (model) {
				model.call(handlerName, event);
			}
		}

		return super.emit(event);
	}

	/**
	 * Update the visibility of the widget.
	 * @protected
	 * @name Widget#_hiddenChanged
	 * @function
	 * @param {boolean} value
	 */
	_hiddenChanged(value:boolean):void {
		this._renderer.updateVisibility(this, !value);
	}

	/**
	 * Gets the index of the widget from the parent's child widgets.
	 * @private
	 * @name Widget#_indexSetter
	 * @function
	 * @returns {number} - index of the widget or -1 if not attached.
	 */
	private _indexGetter():number {
		var parent = this.get('parent');
		return parent ? parent.getChildIndex(this) : -1;
	}

	/**
	 * Initialize the widget, setting the initial style and classList properties.
	 * @protected
	 * @name Widget#_initialize
	 * @function
	 */
	_initialize():void {
		super._initialize();

		// Create Style and ClassList properties
		this.style = new Style();
		this.classList = new ClassList();

		this._renderer.initialize(this);
	}

	/**
	 * Get the next sibling widget.
	 * @private
	 * @name Widget#_nextGetter
	 * @function
	 * @returns {IWidget | null}
	 */
	private _nextGetter():ui.IWidget {
		var parent = this.get('parent');
		return parent ? parent.nextChild(this) : null;
	}

	on(type:IExtensionEvent, listener:(event:core.IEvent) => void):IHandle;
	on(type:string, listener:(event:core.IEvent) => void):IHandle;
	/**
	 * Register a listener for a widget event.
	 * @public
	 * @name Widget#on
	 * @function
	 * @param {IExtensionEvent | string | ?} type
	 * @param {function} listener
	 * @returns {IHandle}
	 */
	on(type:any, listener:(event:core.IEvent) => void):IHandle {
		var handle = super.on.apply(this, arguments);
		this._ownHandles.push(handle);
		return handle;
	}

	placeAt(destination:ui.IWidget, position:PlacePosition):IHandle;
	placeAt(destination:ui.IContainer, position:number):IHandle;
	placeAt(destination:ui.IContainer, placeholder:string):IHandle;
	/**
	 * Place the widget relative to the given destination.
	 * @public
	 * @name Widget#placeAt
	 * @function
	 * @param {IWidget | IContainer} destination
	 * @param {PlacePostion | number | string} position | placeholder
	 * @returns {IHandle}
	 */
	placeAt(destination:any, position:any = PlacePosition.LAST):IHandle {
		var handle:IHandle;

		if (has('debug') && !destination) {
			throw new Error('Cannot place widget at undefined destination');
		}

		var destinationParent:ui.IContainer = destination.get('parent');

		if (position === PlacePosition.BEFORE) {
			if (has('debug') && !destinationParent) {
				throw new Error('Destination widget ' + destination.get('id') + ' must have a parent in order to place before it');
			}

			handle = destinationParent.add(this, destination.get('index'));
		}
		else if (position === PlacePosition.AFTER) {
			if (has('debug') && !destinationParent) {
				throw new Error('Destination widget ' + destination.get('id') + ' must have a parent in order to place after it');
			}

			handle = destinationParent.add(this, destination.get('index') + 1);
		}
		else if (position === PlacePosition.REPLACE) {
			if (has('debug') && !destinationParent) {
				throw new Error('Destination widget ' + destination.get('id') + ' must have a parent in order to replace it');
			}

			var index:number = destination.get('index');
			destination._renderer.detach(destination);
			handle = destinationParent.add(this, index);
		}
		else {
			handle = destination.add(this, position);
		}

		return handle;
	}

	/**
	 * Get the previous sibling widget.
	 * @name Widget#_previousGetter
	 * @function
	 * @private
	 * @returns {IWidget | null}
	 */
	private _previousGetter():ui.IWidget {
		var parent = this.get('parent');
		return parent ? parent.previousChild(this) : null;
	}

	/**
	 * Renders the widget.
	 * @name Widget#_render
	 * @function
	 * @protected
	 */
	_render():void {
		this._renderer.render(this);
		this.set('rendered', true);
	}

	/**
	 * Update the role associated with widget instance. The widget's role is used
	 * to configure its default behaviors and action triggers.
	 * @name Widget#_roleChanged
	 * @function
	 * @protected
	 */
	_roleChanged(value:string):void {
		this._renderer.attachRole(this);

		// TODO: set focusable based on role?
	}

	/**
	 * Add handles to the widget's list of event handles.
	 * @public
	 * @name Widget#own
	 * @function
	 * @param {array} handles
	 */
	own(...handles:any[]):void {
		var owned = this._ownHandles,
			handle:any;
		for (var i = 0, len = handles.length; i < len; ++i) {
			handle = handles[i];
			// List of owned handles is a set
			if (handle && array.indexOf(owned, handle) === -1) {
				owned.push(handle);
			}
		}
	}

	/**
	 * For a given event type, return the evented method name.
	 * @protected
	 * @name Widget#_getEventedMethodName
	 * @function
	 * @param {string} type
	 * @returns {string} - method name
	 */
	_getEventedMethodName(type:string):string {
		type = ('-' + type).toLowerCase().replace(/-([a-z])/g, function ():string {
			return arguments[1].toUpperCase();
		});
		return super._getEventedMethodName(type);
	}

	/**
	 * Adds any manually set styles to widget's Style
	 * @protected
	 * @name Widget#_styleSetter
	 * @function
	 * @param {string} value
	 */
	_styleSetter(value:string):void {
		// TODO: should we blow away any previously set styles instead?
		this.style.set(Style.parse(value));
	}

	/**
	 * Trigger an action on the widget.
	 * @public
	 * @name Widget#trigger
	 * @function
	 * @param {string} actionName
	 * @param {IEvent} source
	 */
	trigger(actionName:string, source?:core.IEvent):void {
		this._renderer.trigger(this, actionName, source);
	}
}

Widget.set('class', '');
Widget.prototype.className = '';

export = Widget;
