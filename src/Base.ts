import Application = require('./Application');
import has = require('./has');
import lang = require('dojo/_base/lang');
import util = require('./util');

type ApplicationFactory = (object: Base) => Application;
type Observer = (change: ChangeRecord) => void;
type LegacyHandle = { remove: () => void; };
type Handle = { destroy: () => void; };

class Base {
	static app: string | Application | ApplicationFactory;

	app: Application;

	constructor(kwArgs?: Base.KwArgs) {
		this.configureApp(kwArgs.app);
		this.initialize();

		for (var key in kwArgs) {
			if (key === 'constructor') {
				continue;
			}

			(<any> this)[key] = (<any> kwArgs)[key];
		}
	}

	protected configureApp(app: Application): void {
		if (app) {
			this.app = app;
		}
		// If `this.app` is set then someone probably set an application object via the prototype, which is a-OK.
		else if (!this.app) {
			var defaultApp: typeof Base.app = (<typeof Base> this.constructor).app;
			if (typeof defaultApp === 'string') {
				this.app = require<Application>(defaultApp);
			}
			else if (typeof defaultApp === 'function') {
				this.app = (<ApplicationFactory> defaultApp)(this);
			}
			else if (typeof defaultApp === 'object' && defaultApp !== null) {
				this.app = <Application> defaultApp;
			}
			else if (has('debug')) {
				throw new Error(
					'An application object must be available to all Base objects. Please pass one to the constructor,'
					+ ' or set the `app` property on the constructor itself.'
				);
			}
		}
	}

	destroy(): void {
		this.destroy = function () {};
	}

	// TODO: Remove, Observable compatibility for converted components
	get(key: string): any {
		console.info('Deprecated get call');
		return (<any> this)[key];
	}

	protected initialize(): void {}

	observe(key: string, observer: Observer): Handle {
		var binding = this.app.binder.createBinding(this, key);
		binding.observe(observer);
		return util.createHandle(function () {
			binding.destroy();
		});
	}

	// TODO: Remove, Observable compatibility for converted components
	set(key: {}): void;
	set(key: string, value: any): void;
	set(key: {} | string, value?: any): void {
		console.info('Deprecated set call');
		if (typeof key === 'string') {
			(<any> this)[key] = value;
		}
		else {
			var kwArgs: HashMap<any> = <any> key;
			for (var k in kwArgs) {
				(<any> this)[k] = kwArgs[k];
			}
		}
	}
}

module Base {
	export interface KwArgs {
		app?: Application;
	}
}

export = Base;
