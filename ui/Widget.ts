/// <amd-dependency path="./renderer!Base" />
declare var require:any;

import has = require('../has');
import ObservableEvented = require('../ObservableEvented');
import PlacePosition = require('./PlacePosition');
var Renderer = require('./renderer!Base');
import ui = require('./interfaces');
import util = require('../util');

var uid = 0,
	registry:{ [id:string]:ui.IWidget } = {};

class Widget extends ObservableEvented implements ui.IWidget {
	static byId(id:string):ui.IWidget {
		return registry[id];
	}

	private _attached:boolean;
	private _eventHandles:IHandle[];
	/* protected */ _parent:ui.IContainer;
	/* protected */ _renderer:ui.IRenderer;
	/* protected */ _renderOptions:ui.IRenderOptions;

	constructor(kwArgs:Object = {}) {
		this._eventHandles = [];

		var id:string = kwArgs['id'];
		if (!id) {
			id = kwArgs['id'] = 'Widget' + (++uid);
		}

		// TDOO: check registry for duplicate id and throw?
		// Helpful for debugging
		registry[id] = this;

		// Note: _initialize is called before widget becomes Observable or Evented
		this._initialize();
		super(kwArgs);
		this._render();
	}

	/* protected */ _attachedSetter(attached:boolean):void {
		if (attached != this._attached) {
			this._attached = !!attached;
			this.emit(attached ? 'attached' : 'detached');
		}
	}

	destroy():void {
		this.detach();
		this._renderer.destroy(this);
		util.destroyHandles(this._eventHandles);
		this._eventHandles = null;

		registry[this.get('id')] = null;
		super.destroy();
		this.emit('destroyed');
	}

	detach():void {
		this._renderer.detach(this);
		// var parent:ui.IContainer = this.get('parent');
		// parent && parent.remove(this);
		this.set('attached', false);
	}

	get:ui.IWidgetGet;

	private _indexGetter():number {
		var parent = this.get('parent');

		if (!parent) {
			return -1;
		}

		return parent.children.indexOf(this);
	}

	/* protected */ _initialize():void {
		this._renderer.initialize(this);
	}

	private _nextGetter():ui.IWidget {
		var index = this.get('index');

		if (index === -1) {
			return null;
		}

		return this.get('parent').children[index + 1] || null;
	}


	on(type:IExtensionEvent, listener:(event:Event) => void):IHandle;
	on(type:string, listener:(event:Event) => void):IHandle;
	on(type:any, listener:(event:Event) => void):IHandle {
		var handle = super.on.apply(this, arguments);
		this._eventHandles.push(handle);
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
		if (parent !== this._parent) {
			this._parent = parent;
			this.emit('parented');
		}
	}

	private _previousGetter():ui.IWidget {
		var index:number = this.get('index');

		if (index === -1) {
			return null;
		}

		return this.get('parent').children[index - 1] || null;
	}

	/* protected */ _render():void {
		this._renderer.render(this, this._renderOptions);
		this.emit('rendered');
	}

	set:ui.IWidgetSet;
}

Widget.prototype._renderer = new Renderer();

export = Widget;
