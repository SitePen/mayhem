/// <amd-dependency path="./renderer!Widget" />
declare var require:any;

import ClassList = require('./style/ClassList');
import core = require('../interfaces');
import has = require('../has');
import ObservableEvented = require('../ObservableEvented');
import PlacePosition = require('./PlacePosition');
import Style = require('./style/Style');
import ui = require('./interfaces');
import util = require('../util');

var Renderer:any = require('./renderer!Widget'),
	uid = 0,
	registry:{ [id:string]:ui.IWidget } = {};

class Widget extends ObservableEvented implements ui.IWidget {
	static byId(id:string):ui.IWidget {
		return registry[id];
	}

	private __id:string;
	/* protected */ _renderer:ui.IRenderer;
	private _ownHandles:any[]; // Array<core.IDestroyable | IHandle>
	/* protected */ _values:ui.IWidgetValues;

	constructor(kwArgs:ui.IWidgetValues = {}) {
		util.deferSetters(this, [ 'attached' ], '_render');
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

	/* protected */ _attachedSetter(attached:boolean):void {
		this._values.attached = attached;
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
			if (handle && owned.indexOf(handle) !== -1) {
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

		this.set('classList', new ClassList());
		this.set('style', new Style());
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

	own(...handles:any[]):void {
		var owned = this._ownHandles,
			handle:any;
		for (var i = 0, len = handles.length; i < len; ++i) {
			handle = handles[i];
			// List of owned handles is a set
			if (handle && owned.indexOf(handle) === -1) {
				owned.push(handle);
			}
		}
	}

	// /* protected */ _visibleGetter():boolean {
	// 	return this.get('style').get('display') !== 'none';
	// }

	/* protected */ _visibleSetter(visible:boolean):void {
		this.get('style').set('display', visible ? '' : 'none');
	}
}

Widget.prototype._renderer = new Renderer();

export = Widget;
