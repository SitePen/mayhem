declare var process:any;

import aspect = require('dojo/aspect');
import Deferred = require('dojo/Deferred');
import has = require('./has');
import Observable = require('./Observable');
import View = require('./ui/View');
import util = require('./util');
import WebApplication = require('./WebApplication');

class ErrorHandler extends Observable {
	private _app:WebApplication;
	private _handleGlobalErrors:boolean;
	private _handle:IHandle;

	get:ErrorHandler.Getters;
	set:ErrorHandler.Setters;

	_initialize():void {
		super._initialize();
		this._handleGlobalErrors = true;
	}

	destroy():void {
		this._handle && this._handle.remove();
		super.destroy();
	}

	handleDomError<T>(error:any):IPromise<T> {
		var self = this;
		var dfd = new Deferred();

		if (typeof error === 'string') {
			error = new Error(error);
		}

		util.getModule(require.toAbsMid('./templating/html') + '!' + require.toAbsMid('./views/Error.html')).then((ErrorView:typeof View):void => {
			var view = new ErrorView({
				app: self._app,
				model: error
			});
			self._app.get('ui').set('view', view);
			dfd.resolve(view);
		});

		return dfd.promise;
	}

	handleNodeError(error:string):void {
		this._app.log(error);
	}

	startup():void {
		var self = this;
		if (this._handleGlobalErrors) {
			if (has('host-browser')) {
				this._handle = aspect.before(window, 'onerror', function (error:Error):void {
					self.handleDomError(error);
				});
			}
			else if (has('host-node')) {
				process.on('uncaughtException', function (error:Error):void {
					self.handleNodeError(error.name);
				});
			}
		}
	}
}

module ErrorHandler {
	export interface Getters extends Observable.Getters {
		(key:'handleGlobalErrors'):boolean;
	}

	export interface Setters extends Observable.Setters {
		(key:'handleGlobalErrors', value:boolean):void;
	}
}

export = ErrorHandler;
