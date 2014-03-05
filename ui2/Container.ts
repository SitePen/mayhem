import AddPosition = require('../ui/AddPosition');
import core = require('../interfaces');
import has = require('../has');
import PlacePosition = require('../ui/PlacePosition');
import ui = require('./interfaces');
import util = require('../util');
import Widget = require('./Widget');

class Container extends Widget implements ui.IContainer {
	/* protected */ _children:ui.IWidget[];
	/* protected */ _mediator:core.IMediator;
	private _parentMediatorHandle:IHandle;

	get:ui.IContainerGet;
	set:ui.IContainerSet;

	constructor(kwArgs?:any) {
		this._children = [];
		super(kwArgs);
	}

	add(widget:ui.IWidget, position?:AddPosition):IHandle;
	add(widget:ui.IWidget, position?:number):IHandle;
	add(widget:ui.IWidget, placeholder?:string):IHandle;
	add(widget:ui.IWidget, position:any = PlacePosition.LAST):IHandle {
		var handle:IHandle;

		if (position === PlacePosition.BEFORE) {
			handle = this.get('parent').add(widget, this.get('index'));
		}
		else if (position === PlacePosition.AFTER) {
			handle = this.get('parent').add(widget, this.get('index') + 1);
		}
		else {
			if (position === PlacePosition.ONLY) {
				this.empty();
				position = PlacePosition.FIRST;
			}
			if (position === PlacePosition.FIRST) {
				position = 0;
			}
			else if (position === PlacePosition.LAST) {
				position = this._children.length;
			}
			else {
				position = Math.max(0, Math.min(this._children.length, position));
			}

			widget.detach();

			var referenceWidget:ui.IWidget = this._children[position];
			this._children.splice(position, 0, widget);
			this._renderer.add(this, widget, referenceWidget);
			widget.set('parent', this);

			var self = this;
			handle = {
				remove: function ():void {
					this.remove = function ():void {};
					self.remove(widget);
					handle = widget = self = null;
				}
			};
		}

		return handle;
	}

	empty():void {
		var widget:ui.IWidget;
		while (this._children.length) {
			this.remove(this._children[0]);
		}
	}

	private _mediatorGetter():core.IMediator {
		if (this._mediator) {
			return this._mediator;
		}
		var parent = this.get('parent');
		if (parent) {
			return parent.get('mediator');
		}
		return null;
	}

	/* protected */ _parentSetter(parent:ui.IContainer):void {
		this._parentMediatorHandle && this._parentMediatorHandle.remove();
		this._parentMediatorHandle = null;
		var mediatorHandler = (newMediator:core.IMediator, oldMediator:core.IMediator):void => {
			// if no mediator has been explicitly set, notify of the parent's mediator change
			if (!this._mediator && !util.isEqual(newMediator, oldMediator)) {
				this._notify(newMediator, oldMediator, 'mediator');
			}
		};
		if (parent) {
			this._parentMediatorHandle = parent.observe('mediator', mediatorHandler);
		}

		var oldParent = this._parent;
		if (!this._mediator && !util.isEqual(parent, oldParent)) {
			mediatorHandler(parent && parent.get('mediator'), oldParent && oldParent.get('mediator'));
		}

		super._parentSetter(parent);
	}

	remove(index:number):void;
	remove(widget:ui.IWidget):void;
	remove(index:any):void {
		var widget:ui.IWidget;

		if (typeof index !== 'number') {
			widget = index;
			index = widget.get('index');

			if (has('debug') && widget !== this._children[index]) {
				throw new Error('Attempt to remove widget ' + widget.get('id') + ' from non-parent ' + this.get('id'));
			}
		}
		else {
			widget = this._children[index];
		}

		this._renderer.remove(this, widget);
		this._children.splice(index, 1);
		widget.set('parent', null);
		// TODO: reset index on other children?
	}
}

export = Container;
