import BaseWidget = require('../Widget');
import ClassList = require('../style/ClassList');
import core = require('../../interfaces');
import ObservableEvented = require('../../ObservableEvented');

var sid:string = String(new Date().getTime());
var uid:number = 0;

class Widget extends ObservableEvented implements BaseWidget {
	/**
	 * @protected
	 */
	_app:core.IApplication;

	/**
	 * @protected
	 */
	_attached:boolean;

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
	_parent:Widget;

	get:Widget.Getters;
	on:Widget.Events;
	set:Widget.Setters;

	constructor(kwArgs?:HashMap<any>) {
		this._classList = new ClassList();

		super(kwArgs);

		if (!this._id) {
			this._id = 'Widget' + sid + (++uid);
		}
	}

	_classGetter():string {
		return this._classList.valueOf();
	}

	_classSetter(value:string):void {
		this._classList.set(value);
	}

	destroy():void {
		this._classList = null;
		super.destroy();
	}
}

module Widget {
	export interface Events extends BaseWidget.Events {}
	export interface Getters extends BaseWidget.Getters {}
	export interface Setters extends BaseWidget.Setters {}
}

export = Widget;
