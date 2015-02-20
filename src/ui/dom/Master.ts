import EventManager = require('./events/EventManager');
import IMaster = require('../Master');
import MultiNodeWidget = require('./MultiNodeWidget');
import Promise = require('../../Promise');
import util = require('../../util');
import View = require('./View');

// TODO: Should not really extend any widget, as master UI is not placed anywhere else. Should just implement IEvented
class Master extends MultiNodeWidget implements IMaster {
	private _eventManager:EventManager;
	private _root:Element;
	private _view:View;

	get:Master.Getters;
	on:Master.Events;
	set:Master.Setters;

	constructor(kwArgs?:HashMap<any>) {
		util.deferSetters(this, [ 'root', 'view' ], 'run', function (setter:string, value:any):void {
			if (setter === 'view') {
				this._view = value;
			}
		});

		super(kwArgs);
	}

	destroy():void {
		this._eventManager && this._eventManager.destroy();
		this._view && this._view.destroy();
		this._view = this._root = null;
		super.destroy();
	}

	_initialize():void {
		super._initialize();
		this.set('root', document.body);
	}

	private _initializeView():void {
		this._root.appendChild(this._view.detach());
		this._view.set({
			isAttached: true,
			parent: this
		});
	}

	_rootGetter():Element {
		return this._root;
	}
	_rootSetter(root:Element):void {
		this._root = root;
		this._eventManager && this._eventManager.destroy();

		if (root) {
			// TODO: Should not allow view to be a string?
			this._view && typeof this._view === 'object' && this._initializeView();
			this._eventManager = new EventManager(this);
		}
	}

	run():Promise<void> {
		var self = this;
		var promise:Promise<void>;

		if (typeof this._view === 'string') {
			promise = util.getModule(<any> this._view).then(function (view:any):Promise<void> {
				return self._app.get('binder').run().then(function ():void {
					// TODO: Should it really be valid to provide an existing view object and not a constructor?
					if (typeof view === 'function') {
						view = new view({ app: self._app });
					}

					self.set('view', view);
				});
			}).otherwise(function (error:Error) {
				self._app.handleError(error);
			});
		}
		else {
			promise = Promise.resolve<void>(undefined);
		}

		this.run = function ():Promise<void> {
			return promise;
		};

		return promise;
	}

	_viewGetter():any {
		return this._view;
	}
	_viewSetter(view:View):void;
	_viewSetter(view:string):void;
	_viewSetter(view:any):void {
		if (this._view && this._view.detach) {
			this._view.detach();
		}

		this._view = view;

		if (view && typeof view === 'object') {
			if (!view.get('model')) {
				view.set('model', this);
			}

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
