import Application from './Application';
import * as binding from './binding/interfaces';
import { createHandle, getPropertyDescriptor } from './util';
import has from './has';

class Base {
	static app: string | Application | Base.ApplicationFactory;

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
				this.app = (<Base.ApplicationFactory> defaultApp)(this);
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

	protected notify(key: string, oldValue?: any) {
		var self: any = this;
/*		this.app.binder.notify(self, key, {
			oldValue: oldValue,
			get value() {
				return self[key];
			}
		});*/
	}

	observe<T>(key: string, observer: binding.IObserver<T>): IHandle {
		var binding = this.app.binder.createBinding(this, key);
		binding.observe(observer);
		return createHandle(function () {
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

	/**
	 * Convenience function for calling the accessor of a parent class computed property.
	 */
	protected superGet(property: string) {
		var descriptor = getPropertyDescriptor(Object.getPrototypeOf(Object.getPrototypeOf(this)), property);
		if (descriptor && descriptor.get) {
			return descriptor.get.call(this);
		}
	}

	/**
	 * Convenience function for calling the accessor of a parent class computed property.
	 */
	protected superSet(property: string, value: any) {
		var descriptor = getPropertyDescriptor(Object.getPrototypeOf(Object.getPrototypeOf(this)), property);
		if (descriptor && descriptor.set) {
			descriptor.set.call(this, value);
		}
	}
}

module Base {
	export interface KwArgs {
		app?: Application;
	}

	export interface ApplicationFactory {
		(object: Base): Application;
	}
}

export default Base;
