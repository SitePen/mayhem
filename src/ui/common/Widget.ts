import ClassList = require('../style/ClassList');
import core = require('../../interfaces');
import IContainer = require('../Container');
import IWidget = require('../Widget');
import ObservableEvented = require('../../ObservableEvented');
import WebApplication = require('../../WebApplication');

var sid:string = String(new Date().getTime() + Math.random());
var uid:number = 0;

/**
 * The Widget class represents a user interface control. Common functionality for all UI controls is encapsulated by
 * this class. End-users should use the available subclasses instead of instantiating Widget directly.
 *
 * @abstract
 */
class Widget extends ObservableEvented implements IWidget {
	/**
	 * The {@link module:mayhem/Application} instance for this view.
	 *
	 * @get
	 * @set
	 * @protected
	 */
	_app:WebApplication;

	/**
	 * @protected
	 */
	_classList:ClassList;

	/**
	 * @protected
	 */
	_id:string;

	/**
	 * @protected
	 */
	_index:number;

	/**
	 * @protected
	 */
	_isAttached:boolean;

	/**
	 * @protected
	 */
	_parent:IWidget	;

	get:Widget.Getters;
	on:Widget.Events;
	set:Widget.Setters;

	constructor(kwArgs?:{}) {
		this._classList = new ClassList();

		super(kwArgs);

		if (!this._id) {
			this._id = 'Widget' + sid + (++uid);
		}

		this._render();
	}

	_initialize():void {
		super._initialize();
		this._isAttached = false;
	}

	private _classGetter():string {
		return this._classList.valueOf();
	}

	private _classSetter(value:string):void {
		this._classList.set(value);
	}

	private _indexGetter():number {
		return this._parent && (<IContainer>this._parent).getChildIndex
			? (<IContainer>this._parent).getChildIndex(this) : -1;
	}

	destroy():void {
		// parent may be a container, in which case it has some extra bookkeeping to do, but not always.
		// TODO: Should we just emit an event instead?
		this._parent && (<IContainer>this._parent).remove && (<IContainer>this._parent).remove(this);
		this._classList = null;
		super.destroy();
	}

	/**
	 * @abstract
	 */
	detach():void {
		this.set('isAttached', false);
	}

	// TODO: Should bubbling be implemented throughout the event system?
	emit(event:core.IEvent):boolean {
		event.currentTarget = this;

		ObservableEvented.prototype.emit.call(this, event);

		var parent:IWidget = this.get('parent');
		if (event.bubbles && !event.propagationStopped && parent) {
			parent.emit(event);
		}

		return !event.defaultPrevented;
	}

	/**
	 * @abstract
	 * @protected
	 */
	_render():void {}
}

module Widget {
	export interface Events extends IWidget.Events {}
	export interface Getters extends IWidget.Getters {}
	export interface Setters extends IWidget.Setters {}
}

export = Widget;
