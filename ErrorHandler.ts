/// <amd-dependency path="./templating/html!./views/Error.html" />

declare var process:any;

import aspect = require('dojo/aspect');
import has = require('./has');
import Observable = require('./Observable');
import View = require('./ui/View');
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

	handleError(error:Error):void {
		var ErrorView:typeof View = <any> require('./templating/html!./views/Error.html');
		var view = new ErrorView({
			app: this._app,
			model: error
		});
		this._app.get('ui').set('view', view);
	}

	startup():void {
		if (this._handleGlobalErrors) {
			if (has('host-browser')) {
				this._handle = aspect.before(window, 'onerror', function ():void {

				});
			}
			else if (has('host-node')) {
				process.on('uncaughtException', function ():void {

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
