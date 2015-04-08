/// <amd-dependency path="./templating/html!./views/Error.html" />

// TODO: Use node.d.ts
declare var process: any;

import Application from './Application';
import { before as aspectBefore } from 'dojo/aspect';
import Base from './Base';
import { createHandle } from './util';
import has from './has';
import { hitch } from 'dojo/_base/lang';
import View = require('./ui/View');
import WebApplication from './WebApplication';

interface ErrorWithStack extends Error {
	stack: string;
}

class ErrorHandler extends Base {
	app: Application | WebApplication;

	/**
	 * Whether this error handler will handle uncaught global errors.
	 * @default true
	 */
	handleGlobalErrors: boolean;

	private _handle: IHandle;

	protected initialize() {
		super.initialize();
		this.handleGlobalErrors = true;
	}

	destroy(): void {
		this._handle && this._handle.remove();
		this._handle = null;
		super.destroy();
	}

	handleError(error: Error): void {
		if (has('host-browser') && (<WebApplication> this.app).ui) {
			var ErrorView: typeof View = <any> require('./templating/html!./views/Error.html');
			var view = new ErrorView({
				app: this.app,
				model: error
			});

			(<WebApplication> this.app).ui.set('view', view);
		}
		else {
			this.app.log((<ErrorWithStack> error).stack || String(error));
		}
	}

	run(): void {
		this.run = function () {};

		var self = this;
		if (this.handleGlobalErrors) {
			if (has('host-browser')) {
				this._handle = aspectBefore(window, 'onerror', function (
					message: string,
					url: string,
					lineNumber: number,
					columnNumber?: number,
					error?: Error
				) {
					if (!error) {
						error = new Error(message);
						(<ErrorWithStack> error).stack = `Error: ${message}\n    at window.onerror (${url}:${lineNumber}:${columnNumber || 0})`;
					}

					self.handleError(error);
				});
			}
			else if (has('host-node')) {
				// Using late binding for the listener in order to allow it to be replaced at runtime if necessary,
				// for e.g. testing
				var listener = hitch(this, 'handleError');
				process.on('uncaughtException', listener);
				this._handle = createHandle(function () {
					process.removeListener('uncaughtException', listener);
				});
			}
		}
	}
}

export default ErrorHandler;
