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

var registry:{ [id:string]:ui.IWidget } = {},
	uid = 0;

if (has('debug')) {
	(<any> window).__widgets = registry;
}

class Widget extends ObservableEvented implements ui.IWidget {
	static byId(id:string):ui.IWidget {
		return registry[id];
	}

	/* protected */ _class:any;
	classList:ClassList;
	className:string;
	/* protected */ _id:string;
	/* protected */ _index:number;
	/* protected */ _next:ui.IWidget;
	private _ownHandles:any[]; // Array<core.IDestroyable | IHandle>
	/* protected */ _parent:ui.IContainer;
	/* protected */ _previous:ui.IWidget;
	/* protected */ _renderer:ui.IRenderer;
	style:Style;
	/* protected */ _visible:boolean;

	constructor(kwArgs:any = {}) {
		this._deferProperty('on', '_render');
		this._ownHandles = [];

		// Capture id as provided before transforming
		var id = kwArgs.id || (kwArgs.id = 'Widget' + (++uid));

		// TODO: check registry for duplicate id and throw?
		registry[id] = this;

		// Always set class to roll in className values of widget and renderer
		kwArgs['class'] || (kwArgs['class'] = '');

		super(kwArgs);
		this._render();
	}

	get:ui.IWidgetGet;
	set:ui.IWidgetSet;

	/* protected */ _classSetter(value:any):void {
		// Reset a widget's classList, incorporating in existing widget and renderer classNames
		this._class = value;

		var classes:any = [];
		this.className && classes.push(this.className);
		this._renderer.className && classes.push(this._renderer.className);

		this.classList.add(classes.concat(ClassList.parse(value)).join(' '));
	}

	/* protected */ _deferProperty(name:string, ...untilMethods:string[]):void {
		var setterName = '_' + name + 'Setter',
			originalSetter:any = this[setterName],
			outstandingMethods = untilMethods.length,
			values:any[] = [];

		this[setterName] = (value:any):void => {
			values.push(value);
		};

		var untilHandles:any[] = array.map(untilMethods, (method:string, i:number) => {
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

	detach():void {
		var parent = this.get('parent');
		parent && parent.remove(this);
	}

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

	private _indexGetter():number {
		var parent = this.get('parent');

		if (!parent) {
			return -1;
		}

		return parent.getChildIndex(this);
	}

	/* protected */ _initialize():void {
		super._initialize();

		// Create Style and ClassList properties
		this.style = new Style();
		this.classList = new ClassList();

		this._renderer.initialize(this);
	}

	private _nextGetter():ui.IWidget {
		var parent = this.get('parent');
		return parent ? parent.nextChild(this) : null;
	}

	on(type:IExtensionEvent, listener:(event:Event) => void):IHandle;
	on(type:string, listener:(event:Event) => void):IHandle;
	on(type:any, listener:(event:Event) => void):IHandle {
		var handle = super.on.apply(this, arguments);
		this._ownHandles.push(handle);
		return handle;
	}

	placeAt(destination:ui.IWidget, position:PlacePosition):IHandle;
	placeAt(destination:ui.IContainer, position:number):IHandle;
	placeAt(destination:ui.IContainer, placeholder:string):IHandle;
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

	private _previousGetter():ui.IWidget {
		var parent = this.get('parent');
		return parent ? parent.previousChild(this) : null;
	}

	/* protected */ _render():void {
		this._renderer.render(this);
		this.set('rendered', true);
	}

	/* protected */ _renderedChanged(value:boolean, previous:boolean):void {
		if (value) {
			this.emit(previous === false ? 'rerendered' : 'rendered');
		}
		else {
			this.emit('unrendered');
		}
	}

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

	/* protected */ _selectedChanged(value:boolean, previous:boolean):void {
		if (value === true) {
			this.emit('selected');
		}
		if (value === false && previous === true) {
			this.emit('unselected');
		}
		if (typeof value === 'boolean' && previous !== null) {
			this.emit('toggled');
		}
	}

	/* protected */ _styleSetter(value:string) {
		// Adds any manually set styles to widget's Style
		this.style.set(Style.parse(value));
	}

	// /* protected */ _visibleGetter():boolean {
	// 	return this.style.get('display') !== 'none';
	// }

	/* protected */ _visibleSetter(visible:boolean):void {
		this.style.set('display', visible ? '' : 'none');
	}
}

Widget.prototype.className = '';

export = Widget;
