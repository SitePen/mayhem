/// <amd-dependency path="./templating/html!./views/Error.html" />

declare var process:any;

import aspect = require('dojo/aspect');
import has = require('./has');
import lang = require('dojo/_base/lang');
import Observable = require('./Observable');
import util = require('./util');
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
		this._handle = null;
		super.destroy();
	}

	handleError(error:Error):void {
		if (has('host-browser') && this._app.get('ui')) {
			var ErrorView:typeof View = <any> require('./templating/html!./views/Error.html');
			var view = new ErrorView({
				app: this._app,
				model: error
			});

			this._app.get('ui').set('view', view);
		}
		else {
			this._app.log((<any> error).stack || String(error));
		}
	}

	run():void {
		this.run = function ():void {};

		var self = this;
		if (this._handleGlobalErrors) {
			if (has('host-browser')) {
				this._handle = aspect.before(window, 'onerror', function (
					message:string,
					url:string,
					lineNumber:number,
					columnNumber?:number,
					error?:Error
				):void {
					if (!error) {
						error = new Error(message);
						(<any> error).stack = 'Error: ' + message +
							'\n    at window.onerror (' + url + ':' + lineNumber + ':' + (columnNumber || 0) + ')';
					}

					self.handleError(error);
				});
			}
			else if (has('host-node')) {
				var listener = lang.hitch(this, 'handleError');
				process.on('uncaughtException', listener);
				this._handle = util.createHandle(function () {
					process.removeListener('uncaughtException', listener);
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
