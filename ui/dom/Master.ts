import IMaster = require('../Master');
import MultiNodeWidget = require('./MultiNodeWidget');
import Promise = require('../../Promise');
import util = require('../../util');
import View = require('./View');

class Master extends MultiNodeWidget implements IMaster {
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

	_initialize():void {
		this._root = document.body;
	}

	destroy():void {
		this._view.destroy();
		this._view = this._root = null;
		super.destroy();
	}

	startup():IPromise<void> {
		if (typeof this._view === 'string') {
			var self = this;
			return util.getModule(<any> this._view).then(function (view:any):void {
				if (typeof view === 'function') {
					view = new view({ app: self._app });
				}

				self.set('view', view);
			});
		}

		return Promise.resolve<void>(undefined);
	}

	_rootSetter(root:Element):void {
		var viewNode:Node = this._view && this._view.detach();
		this._root = root;

		if (root && viewNode) {
			root.appendChild(viewNode);
			this._view.set('isAttached', true);
		}
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

			if (this._root) {
				this._root.appendChild(this._view.detach());
				this._view.set('isAttached', true);
			}
		}
	}
}

module Master {
	export interface Events extends MultiNodeWidget.Events, IMaster.Events {}
	export interface Getters extends MultiNodeWidget.Getters, IMaster.Getters {
		(key:'root'):Element;
	}
	export interface Setters extends MultiNodeWidget.Setters, IMaster.Setters {
		(key:'root', value:Element):void;
	}
}

export = Master;
