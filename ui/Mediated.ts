import AddPosition = require('./AddPosition');
import core = require('../interfaces');
import data = require('../data/interfaces');
import has = require('../has');
import PlacePosition = require('./PlacePosition');
import ui = require('./interfaces');
import util = require('../util');
import Widget = require('./Widget');

class Mediated extends Widget implements ui.IMediated {
	private _parentAppHandle:IHandle;
	private _parentMediatorHandle:IHandle;
	private _attachedWidgets:ui.IWidget[];

	constructor(kwArgs?:any) {
		this._attachedWidgets = [];
		super(kwArgs);
	}

	// Set widget parent and bind widget's attached state to parent
	// This doesn't fully express parent/child relationship, just the parent side (to propagate attachment information)
	attach(widget:ui.IWidget):void {
		this._attachedWidgets.push(widget);
		widget.set('parent', this);
		widget.set('attached', this.get('attached'));
		// On widget detach extract from attachedWidgets array
		// widget.once('detached', () => util.spliceMatch(this._attachedWidgets, widget))
	}

	/* protected */ _attachedSetter(attached:boolean):void {
		var widget:ui.IWidget;
		// Propagate attachment information
		for (var i = 0; (widget = this._attachedWidgets[i]); ++i) {
			widget.set('attached', attached);
		}

		super._attachedSetter(attached);
	}

	destroy():void {
		this.detach();
		// Loop over attached widgets and de-parent them
		var widget:ui.IWidget;
		for (var i = 0; (widget = this._attachedWidgets[i]); ++i) {
			widget.set('parent', null);
		}
		super.destroy();
	}

	get:ui.IMediatedGet;

	private _mediatorGetter():data.IMediator {
		if (this._values.mediator) {
			return this._values.mediator;
		}
		var parent = this.get('parent');
		if (parent) {
			return parent.get('mediator');
		}
		return null;
	}

	/* protected */ _parentSetter(parent:ui.IContainer):void {
		// Pass app down to children
		// TODO: kill this
		this._parentAppHandle && this._parentAppHandle.remove();
		if (!this.get('app')) {
			var parentApp:core.IApplication = parent.get('app');
			if (parentApp) {
				this.set('app', parentApp);
			}
			else {
				this._parentAppHandle = parent.observe('app', (parentApp:core.IApplication):void => {
					// Only once
					this._parentAppHandle.remove();
					this._parentAppHandle = null;
					this.set('app', parentApp);
				});
			}
		}

		var oldParent = this._parent;
		super._parentSetter(parent);

		this._parentMediatorHandle && this._parentMediatorHandle.remove();
		this._parentMediatorHandle = null;
		var mediatorHandler = (newMediator:data.IMediator, oldMediator:data.IMediator):void => {
			// if no mediator has been explicitly set, notify of the parent's mediator change
			if (!this._values.mediator && !util.isEqual(newMediator, oldMediator)) {
				this._notify(newMediator, oldMediator, 'mediator');
			}
		};
		if (parent) {
			this._parentMediatorHandle = parent.observe('mediator', mediatorHandler);
		}
		if (!this._values.mediator && !util.isEqual(parent, oldParent)) {
			mediatorHandler(parent && parent.get('mediator'), oldParent && oldParent.get('mediator'));
		}
	}

	set:ui.IMediatedSet;
}

export = Mediated;
