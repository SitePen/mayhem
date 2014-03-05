/// <amd-dependency path="./renderer!Base" />
declare var require:any;

import has = require('../has');
import ObservableEvented = require('../ObservableEvented');
import PlacePosition = require('../ui/PlacePosition');
var Renderer = require('./renderer!Base');
import ui = require('./interfaces');

var uid = 0,
	registry:{ [id:string]:ui.IWidget } = {};

class Widget extends ObservableEvented implements ui.IWidget {
	static byId(id:string):ui.IWidget {
		return registry[id];
	}

	/* protected */ _attached:boolean;
	/* protected */ _id:string;
	/* protected */ _parent:ui.IContainer;
	private _parentAttachedHandle:IHandle;
	/* protected */ _renderer:ui.IRenderer;

	get:ui.IWidgetGet;
	set:ui.IWidgetSet;

	constructor(kwArgs:Object = {}) {
		var id:string = kwArgs['id'];
		if (!id) {
			id = this._id = 'Widget' + (++uid);
		}

		// TDOO: check registry for duplicate id and throw?
		// Helpful for debugging
		registry[id] = this;

		super(kwArgs);

		this._render();
	}

	destroy():void {
		this.detach();

		this._renderer.destroy(this);

		registry[this.get('id')] = null;
		super.destroy();
	}

	detach():void {
		var parent:ui.IContainer = this.get('parent');
		parent && parent.remove(this);
	}

	private _indexGetter():number {
		var parent = this.get('parent');

		if (!parent) {
			return -1;
		}

		return parent.get('children').indexOf(this);
	}

	private _nextGetter():ui.IWidget {
		var index = this.get('index');

		if (index === -1) {
			return null;
		}

		return this.get('parent').get('children')[index + 1] || null;
	}

	/* protected */ _parentSetter(parent:ui.IContainer):void {
		this._parent = parent;

		// Observe parent's attached state
		this._parentAttachedHandle && this._parentAttachedHandle.remove();
		this._parentAttachedHandle = null;

		if (!parent) {
			return;
		}

		this._parentAttachedHandle = parent.observe('attached', (parentAttached:boolean):void => {
			if (this._attached !== parentAttached) {
				this.set('attached', parentAttached);
			}
		});
		if (parent.get('attached')) {
			this.set('attached', true);
		}
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
}

Widget.prototype._renderer = new Renderer();

export = Widget;
