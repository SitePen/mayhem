import AddPosition = require('../AddPosition');
import ContainerMixin = require('../common/Container');
import DijitDialog = require('dijit/Dialog');
import DijitWidget = require('./DijitWidget');
import IDialog = require('../Dialog');
import util = require('../../util');
import Widget = require('./Widget');

class Dialog extends DijitWidget implements IDialog {
	static Ctor = DijitDialog;

	protected _containerNode:HTMLElement;
	_widget:DijitDialog;

	protected _children:Widget[];
	protected _childrenGetter():Widget[] {
		return ContainerMixin.prototype._childrenGetter.apply(this, arguments);
	}
	protected _childrenSetter(children:Widget[]):void {
		ContainerMixin.prototype._childrenSetter.apply(this, arguments);
	}

	_isAttachedGetter():boolean {
		return ContainerMixin.prototype._isAttachedGetter.apply(this, arguments);
	}
	_isAttachedSetter(value:boolean):void {
		ContainerMixin.prototype._isAttachedSetter.apply(this, arguments);
	}

	protected _isOpen:boolean;
	protected _isOpenGetter():boolean {
		return this._isOpen;
	}
	protected _isOpenSetter(value:boolean):void {
		var type = value ? 'show' : 'hide';
		this._isOpen = value;
		(<any>this._widget)[type]();
	}

	protected _title:string;
	protected _titleGetter():string {
		return this._title;
	}
	protected _titleSetter(title:string):void {
		this._title = title;
		this._widget.set('title', title);
	}

	get:Dialog.Getters;
	on:Dialog.Events;
	set:Dialog.Setters;

	constructor(kwArgs?:HashMap<any>) {
		util.deferSetters(this, [ 'title', 'children', 'isOpen' ], '_render');
		super(kwArgs);
		ContainerMixin.apply(this, arguments);
	}

	_initialize():void {
		super._initialize();
		ContainerMixin.prototype._initialize.call(this);
	}

	_render():void {
		super._render();

		this._containerNode = this._widget.containerNode;

		var self = this;
		this._widget.watch('open', function (name:string, oldValue:boolean, newValue:boolean):void {
			if (!newValue) {
				self.set('isOpen', false);
			}
		});
	}

	add(child:Widget, position?:AddPosition):IHandle;
	add(child:Widget, position?:number):IHandle;
	add(child:Widget, position:any = AddPosition.LAST):IHandle {
		var children = this._children;

		if (position === AddPosition.LAST) {
			position = children.length;
		}

		var nextWidget:Widget = children[position];
		var nextNode:Node = nextWidget ? nextWidget.get('firstNode') : null;

		this._containerNode.insertBefore(child.detach(), nextNode);
		children.splice(position, 0, child);
		ContainerMixin.prototype.add.call(this, child);

		var self = this;
		return util.createHandle(function () {
			self.remove(child);
			self = child = null;
		});
	}

	destroy():void {
		ContainerMixin.prototype.destroy.call(this);
		super.destroy();
	}

	empty():void {
		ContainerMixin.prototype.empty.apply(this, arguments);
	}

	getChildIndex(child:Widget):number {
		return ContainerMixin.prototype.getChildIndex.apply(this, arguments);
	}

	remove(index:number):void;
	remove(child:Widget):void;
	remove(index:any):void {
		var children:Widget[] = this._children;
		var widget:Widget;

		if (typeof index !== 'number') {
			widget = index;
			index = widget.get('index');

			if (widget !== children[index]) {
				throw new Error('Attempt to remove widget ' + widget.get('id') + ' from non-parent ' + this._id);
			}
		}
		else {
			widget = children[index];

			if (!widget) {
				throw new Error('No widget exists in container ' + this._id + ' at index ' + index);
			}
		}

		ContainerMixin.prototype.remove.call(this, children.splice(index, 1)[0]);
	}
}

module Dialog {
	export interface Events extends DijitWidget.Events, IDialog.Events {}
	export interface Getters extends DijitWidget.Getters, IDialog.Getters {}
	export interface Setters extends DijitWidget.Setters, IDialog.Setters {}
}

export = Dialog;
