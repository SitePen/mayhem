/// <reference path="../../dojo" />
import EventManager = require('./EventManager');
import IMaster = require('../Master');
import MultiNodeWidget = require('./MultiNodeWidget');
import Promise = require('../../Promise');
import util = require('../../util');
import View = require('./View');

class Master extends MultiNodeWidget implements IMaster {
	private _eventManager:EventManager;
	private _root:Element;
	private _view:View;

	get:Master.Getters;
	on:Master.Events;
	set:Master.Setters;

	constructor(kwArgs?:HashMap<any>) {
		util.deferSetters(this, [ 'root', 'view' ], 'startup', function (setter:string, value:any):void {
			if (setter === 'view') {
				this._view = value;
			}
		});

		super(kwArgs);
	}

	destroy():void {
		this._view.destroy();
		this._view = this._root = null;
		super.destroy();
	}

	_initialize():void {
		this._root = document.body;
	}

	private _initializeView():void {
		this._root.appendChild(this._view.detach());
		this._view.set('isAttached', true);

		// TODO: Changing root after loading EventManager once will break things right now, it needs to be
		// much more graceful
		this._eventManager = new EventManager(this);
	}

	_rootSetter(root:Element):void {
		this._root = root;
		root && this._view && this._initializeView();
	}

	startup():Promise<void> {
		var self = this;
		var promise:Promise<void>;

		if (typeof this._view === 'string') {
			promise = util.getModule(<any> this._view).then(function (view:any):Promise<void> {
				return self._app.get('binder').startup().then(function ():void {
					// TODO: Should it really be valid to provide an existing view object and not a constructor?
					if (typeof view === 'function') {
						view = new view({ app: self._app });
					}

					self.set('view', view);
				});
			});
		}
		else {
			promise = Promise.resolve<void>(undefined);
		}

		this.startup = function ():Promise<void> {
			return promise;
		};

		return promise;
	}

	_viewSetter(view:View):void;
	_viewSetter(view:string):void;
	_viewSetter(view:any):void {
		if (this._view && this._view.destroy) {
			this._view.destroy();
		}

		this._view = view;

		if (view && typeof view === 'object') {
			view.set('model', this._app);

			this._root && this._initializeView();
		}
	}
}

module Master {
	export interface Events extends MultiNodeWidget.Events, IMaster.Events {}
	export interface Getters extends MultiNodeWidget.Getters, IMaster.Getters {
		(key:'eventManager'):EventManager;
		(key:'root'):Element;
	}
	export interface Setters extends MultiNodeWidget.Setters, IMaster.Setters {
		(key:'root', value:Element):void;
	}
}

export = Master;
