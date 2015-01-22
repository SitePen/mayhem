import domClass = require('dojo/dom-class');
import domConstruct = require('dojo/dom-construct');
import IDropDown = require('../DropDown');
import lang = require('dojo/_base/lang');
import SingleNodeWidget = require('./SingleNodeWidget');
import Widget = require('./Widget');
import ui = require('../interfaces');
import util = require('../../util');

function proxyAttachmentState(widget:DropDown, properties:string[], value:any) {
	for (var i = 0, j = properties.length; i < j; ++i) {
		var child:Widget = <any> widget.get(properties[i]);
		if (child) {
			child.set('isAttached', value);
		}
	}
}

function contains(maybeParent:Widget, candidate:Widget):boolean {
	do {
		if (maybeParent === candidate) {
			return true;
		}
	} while ((candidate = candidate.get('parent')));

	return false;
}

class DropDown extends SingleNodeWidget implements IDropDown {
	get:DropDown.Getters;
	on:DropDown.Events;
	set:DropDown.Setters;

	protected _dropDownNode:HTMLDivElement;
	protected _globalHandle:IHandle;
	protected _labelHandle:IHandle;
	protected _labelNode:HTMLDivElement;

	constructor(kwArgs?:{}) {
		util.deferSetters(this, [ 'label', 'dropDown' ], '_render');
		super(kwArgs);
	}

	_childrenGetter():[ Widget, Widget ] {
		return [ this.get('label'), this.get('dropDown') ];
	}
	_childrenSetter(children:[ Widget, Widget ]):void {
		if (children) {
			this.set('label', children[0]);
			this.set('dropDown', children[1]);
		}
		else {
			this.set('label', null);
			this.set('dropDown', null);
		}
	}

	protected _dropDown:Widget;
	_dropDownGetter():Widget {
		return this._dropDown;
	}
	_dropDownSetter(value:Widget):void {
		if (this._dropDown) {
			this._dropDown.detach();
			this._dropDown.set({ isAttached: false, parent: null });
		}

		this._dropDown = value;

		if (value) {
			this._dropDownNode.appendChild(value.detach());
			value.set({ isAttached: this.get('isAttached'), parent: this });
		}
	}

	_isAttached:boolean;
	_isAttachedGetter():boolean {
		return this._isAttached;
	}
	_isAttachedSetter(value:boolean) {
		proxyAttachmentState(this, [ 'label', 'dropDown' ], value);
		this._isAttached = value;
	}

	_isOpen:boolean;
	_isOpenGetter():boolean {
		return this._isOpen;
	}
	_isOpenSetter(value:boolean) {
		this._isOpen = value;
		domClass.toggle(this._node, 'open', value);
	}

	protected _label:Widget;
	_labelGetter():Widget {
		return this._label;
	}
	_labelSetter(value:Widget):void {
		this._labelHandle && this._labelHandle.remove();

		if (this._label) {
			this._label.detach();
			this._label.set({ isAttached: false, parent: null });
		}

		this._label = value;

		if (value) {
			var self = this;
			this._labelHandle = util.createCompositeHandle(
				value.on('activate', lang.hitch(this, '_toggle')),
				value.observe('parent', function (newParent:Widget) {
					if (newParent !== self) {
						self.set('label', null);
					}
				})
			);

			this._labelNode.appendChild(value.detach());
			value.set({ isAttached: this.get('isAttached'), parent: this });
		}
	}

	destroy():void {
		super.destroy();
		this._label && this._label.destroy();
		this._dropDown && this._dropDown.destroy();
		this._globalHandle.remove();
	}

	_render():void {
		this._node = domConstruct.create('div', { className: 'DropDown' });
		this._labelNode = domConstruct.create('div', { className: 'LabelContainer' }, this._node);
		this._dropDownNode = domConstruct.create('div', { className: 'DropDownContainer' }, this._node);

		var self = this;
		this._globalHandle = this.get('app').get('ui').on('pointerdown', function (event:ui.PointerEvent) {
			if (self.get('isOpen') && !contains(self.get('dropDown'), <Widget> event.target)) {
				self.set('isOpen', false);
				event.stopPropagation();
				event.preventDefault();
			}
		});
	}

	protected _toggle(event:ui.UiEvent):void {
		if (!this.get('isOpen')) {
			this.set('isOpen', true);
			event.stopPropagation();
			event.preventDefault();
		}
	}
}

module DropDown {
	export interface Events extends SingleNodeWidget.Events, IDropDown.Events {}
	export interface Getters extends SingleNodeWidget.Getters, IDropDown.Getters {
		(key:'dropDown'):Widget;
		(key:'label'):Widget;
	}
	export interface Setters extends SingleNodeWidget.Setters, IDropDown.Setters {
		(key:'dropDown', value:Widget):void;
		(key:'label', value:Widget):void;
	}
}

export = DropDown;
