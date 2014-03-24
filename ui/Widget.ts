/// <amd-dependency path="./renderer!Widget" />
declare var require:any;

import core = require('../interfaces');
import has = require('../has');
import ObservableEvented = require('../ObservableEvented');
import PlacePosition = require('./PlacePosition');
import ui = require('./interfaces');
import util = require('../util');

var Renderer:any = require('./renderer!Widget'),
	uid = 0,
	registry:{ [id:string]:ui.IWidget } = {};

class Widget extends ObservableEvented implements ui.IWidget {
	static byId(id:string):ui.IWidget {
		return registry[id];
	}

	private _attachedWidgets:ui.IWidget[];
	private __id:string;
	/* protected */ _renderer:ui.IRenderer;
	private _ownHandles:any[]; // Array<core.IDestroyable | IHandle>
	/* protected */ _values:ui.IWidgetValues;

	constructor(kwArgs:ui.IWidgetValues = {}) {
		util.deferSetters(this, [ 'attached' ], '_render');
		this._attachedWidgets = [];
		this._ownHandles = [];

		// Capture id as provided before transforming
		if (kwArgs.id) {
			this.__id = kwArgs.id;
		}
		var id = kwArgs.id || (kwArgs.id = 'Widget' + (++uid));

		// TODO: check registry for duplicate id and throw?
		// Helpful for debugging
		registry[id] = this;

		super(kwArgs);
		this._render();
	}

	get:ui.IWidgetGet;
	set:ui.IWidgetSet;

	// Set widget parent and bind widget's attached state to parent
	// This doesn't fully express parent/child relationship, just the parent side (to propagate attachment information)
	attach(widget:ui.IWidget):void {
		this._attachedWidgets.push(widget);
		widget.set('parent', this);
		var attached = this.get('attached');
		attached !== undefined && widget.set('attached', attached);
		// On widget detach extract from attachedWidgets array
		var handle = widget.on('detached', () => {
			handle.remove();
			util.spliceMatch(this._attachedWidgets, widget);
			handle = widget = null;
		});
	}

	destroy():void {
		this.detach();

		// Loop over attached widgets and de-parent them
		var widget:ui.IWidget;
		for (var i = 0; (widget = this._attachedWidgets[i]); ++i) {
			widget.set('parent', null);
		}
		widget = null;

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
		this.emit('destroyed');
	}

	detach():void {
		this._renderer.detach(this);
		this.set('attached', false);
	}

	private _indexGetter():number {
		var parent = this.get('parent');

		if (!parent) {
			return -1;
		}

		return parent.get('children').indexOf(this);
	}

	/* protected */ _initialize():void {
		super._initialize();
		this._renderer.initialize(this);

		this.observe('attached', (value:boolean):void => {
			// Propagate attachment information
			for (var i = 0, widget:ui.IWidget; (widget = this._attachedWidgets[i]); ++i) {
				widget.set('attached', value);
			}
		});
	}

	private _nextGetter():ui.IWidget {
		var index = this.get('index');

		if (index === -1) {
			return null;
		}

		return this.get('parent').get('children')[index + 1] || null;
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
			destination.detach();
			handle = destinationParent.add(this, index);
		}
		else {
			handle = destination.add(this, position);
		}

		return handle;
	}

	/* protected */ _parentSetter(parent:ui.IContainer):void {
		if (parent !== this._values.parent) {
			this._values.parent = parent;
			this.emit('parented');
		}
	}

	private _previousGetter():ui.IWidget {
		var index:number = this.get('index');

		if (index === -1) {
			return null;
		}

		return this.get('parent').get('children')[index - 1] || null;
	}

	/* protected */ _render():void {
		this._renderer.render(this);
	}

	own(...handles:any[]):void {
		handles.length && this._ownHandles.push.apply(this._ownHandles, handles);
	}
}

Widget.prototype._renderer = new Renderer();

export = Widget;
