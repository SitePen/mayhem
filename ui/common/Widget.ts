import ClassList = require('../style/ClassList');
import IContainer = require('../Container');
import IWidget = require('../Widget');
import ObservableEvented = require('../../ObservableEvented');
import WebApplication = require('../../WebApplication');

var sid:string = String(new Date().getTime() + Math.random());
var uid:number = 0;

/**
 * The
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
	_parent:IContainer;

	get:Widget.Getters;
	on:Widget.Events;
	set:Widget.Setters;

	constructor(kwArgs?:HashMap<any>) {
		this._classList = new ClassList();

		super(kwArgs);

		if (!this._id) {
			this._id = 'Widget' + sid + (++uid);
		}

		this._render();
	}

	private _classGetter():string {
		return this._classList.valueOf();
	}

	private _classSetter(value:string):void {
		this._classList.set(value);
	}

	private _indexGetter():number {
		return this._parent ? this._parent.getChildIndex(this) : -1;
	}

	destroy():void {
		this._parent && this._parent.remove(this);
		this._classList = null;
		super.destroy();
	}

	/**
	 * @abstract
	 */
	detach():void {
		this.set('isAttached', false);
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
