import core = require('../../interfaces');
import IMaster = require('../Master');
import MultiNodeWidget = require('./MultiNodeWidget');
import Promise = require('../../Promise');
import util = require('../../util');
import View = require('./View');

class Master extends MultiNodeWidget implements IMaster, core.IApplicationComponent {
	private _root:Element;
	private _view:View;

	get:Master.Getters;
	on:Master.Events;
	set:Master.Setters;

	constructor(kwArgs?:HashMap<any>) {
		util.deferSetters(this, [ 'root', 'view' ], 'startup');
		super(kwArgs);
	}

	_initialize():void {
		this._root = document.body;
	}

	destroy():void {
		this._view.destroy();
		this._view = this._root = null;
		super.destroy();
	}

	startup():IPromise<Master> {
		this._root.appendChild(this._view.detach());
		return Promise.resolve(this);
	}

	_rootSetter(root:Element):void {
		this._root = root;

		if (this._view) {
			root.appendChild(this._view.detach());
			this._view.set('attached', true);
		}
	}

	_viewSetter(view:View):void {
		if (this._view) {
			this._view.destroy();
		}

		view.set('model', this._app);
		this._view = view;

		if (this._root) {
			this._root.appendChild(this._view.detach());
			this._view.set('attached', true);
		}
	}
}

module Master {
	export interface Events extends MultiNodeWidget.Events, IMaster.Events {}
	export interface Getters extends core.IApplicationComponent.Getters, MultiNodeWidget.Getters, IMaster.Getters {
		(key:'root'):Element;
		(key:'view'):View;
	}
	export interface Setters extends core.IApplicationComponent.Setters, MultiNodeWidget.Setters, IMaster.Setters {
		(key:'root', value:Element):void;
		(key:'view', value:View):void;
	}
}

export = Master;
