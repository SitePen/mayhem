import Base = require('./Base');
import binding = require('./binding/interfaces');
import core = require('./interfaces');
import ErrorHandler = require('./ErrorHandler');
import has = require('./has');
import I18n = require('./I18n');
import lang = require('dojo/_base/lang');
import LogLevel = require('./LogLevel');
import ObservableEvented = require('./ObservableEvented');
import Promise = require('./Promise');
import Scheduler = require('./Scheduler');
import util = require('./util');

// TODO: External interface
type ApplicationComponent = { run?(): Promise<any> | void; };
type Constructor = string | ComponentConstructor;
type Destroyable = { destroy(): void; };

// TODO: External module
type Logger = { log(message: string, level?: LogLevel, category?: string ): void; };

var resolve:(moduleId:string) => string = (<any> require).toAbsMid || (<any> require).resolve;

var defaultBindings:string[] = [
	resolve('./binding/bindings/CompositeBinding'),
	resolve('./binding/bindings/ObjectMethodBinding'),
	resolve('./binding/bindings/NestedBinding'),
	resolve('./binding/bindings/ObservableBinding'),
	resolve('./binding/bindings/StatefulBinding'),
	resolve('./binding/bindings/CollectionLengthBinding'),
	resolve('./binding/bindings/CollectionBinding'),
	resolve('./binding/bindings/ArrayBinding'),
	resolve('./binding/bindings/DomInputBinding')
];

if (has('es7-object-observe')) {
	defaultBindings.push(resolve('./binding/bindings/Es7Binding'));
}
else {
	defaultBindings.push(
		resolve('./binding/bindings/Es5Binding'),
		resolve('./binding/bindings/ObjectTargetBinding')
	);
}

interface ComponentConstructor {
	new (kwArgs?:{}): ApplicationComponent;
	prototype: ApplicationComponent;
}

/**
 * The Application class is the base class for all Mayhem application classes. An instance of Application acts as the
 * global object for an application and exposes application components that provide shared functionality for the entire
 * application.
 *
 * The core application components provided by the Application class are:
 *
 * * {@link module:mayhem/binding/Binder binder}: Provides an interface for creating data bindings between objects.
 * * {@link module:mayhem/Scheduler scheduler}: Provides an interface for efficiently registering actions that should
 *   be executed on the next turn through the event loop.
 *
 * The various Application subclasses that are included with Mayhem include additional application components suitable
 * for different types of applications.
 *
 * A Mayhem application is typically customised by passing a {@link TODO configuration object} to the Application
 * constructor. It is also possible to customise an application by subclassing the Application class to provide a new
 * default configuration.
 *
 * The startup lifecycle of an Application instance is as follows:
 *
 * 1. The Application object is constructed
 * 2. The configuration object passed to the constructor is merged into the default configuration object for the
 *    Application subclass
 * 3. {@link module:mayhem/Application#run} is called by the user when they are ready for the application to start
 * 4. Unloaded application component constructors from the
 *    {@link module:mayhem/Application#components components configuration} are {@link external:require required}
 * 5. Application components from the {@link module:mayhem/Application#components components configuration} are
 *    instantiated and attached to the Application object
 * 6. The {@link module:mayhem/ApplicationComponent#run} method is called on application components that have a
 *    `run` method
 * 7. Once all application components have finished starting, the promise returned by the
 *    {@link module:mayhem/Application#run} method is resolved
 *
 * If an error occurs during the startup lifecycle, the promise returned by the `run` method will be rejected.
 *
 * @example
 * An Application created with a custom application component:
 *
 * ```ts
 * var app:Application = new Application({
 *   name: 'Hello world',
 *   components: {
 *     myService: {
 *       constructor: 'app/services/CustomService',
 *       configFoo: 'foo'
 *     }
 *   }
 * });
 * ```
 *
 * Internally, this will do something similar to the following when {@link module:mayhem/Application#run} is called:
 *
 * ```ts
 * require([ 'app/services/CustomService' ], function (CustomService) {
 *   app.myService = new CustomService({ configFoo: 'foo' });
 *   app.myService.run && app.myService.run();
 * });
 * ```
 */
class Application extends Base {
	/**
	 * The default configuration for the Application class.
	 */
	protected static defaultConfig = {
		components: {
			binder: {
				constructor: resolve('./binding/Binder'),
				constructors: defaultBindings
			},
			errorHandler: {
				constructor: resolve('./ErrorHandler')
			},
			i18n: {
				constructor: resolve('./I18n')
			},
			scheduler: {
				constructor: resolve('./Scheduler')
			}
		}
	};

	/**
	 * The data binder component.
	 * @default module:mayhem/binding/Binder
	 */
	binder: binding.IBinder;

	/**
	 * A hash map of application components that will be dynamically loaded and set on the Application object when it is
	 * {@link module:mayhem/Application#run started}. The values of the map are {@link TODO keyword arguments}
	 * objects that should be passed to a constructor function, plus a `constructor` key indicating the constructor
	 * function to use. The `constructor` value can either be a module ID, in which case the module will be dynamically
	 * loaded at runtime and its value used as the constructor, or a constructor function, in which case it will be used
	 * as-is. The constructor must accept a keyword arguments object as its only argument.
	 */
	components: {};

	/**
	 * The error handler component.
	 * @default module:mayhem/ErrorHandler
	 */
	errorHandler: ErrorHandler;

	/**
	 * The internationalisation component.
	 * @default module:mayhem/I18n
	 */
	i18n: I18n;

	/**
	 * The debug logger component.
	 */
	logger: Logger;

	/**
	 * The event scheduler component.
	 * @default module:mayhem/Scheduler
	 */
	scheduler: Scheduler;

	constructor(kwArgs?: {}) {
		// TODO: more robust configuration merging
		kwArgs = <any> util.deepCreate((<typeof Application> this.constructor).defaultConfig, kwArgs);
		super(kwArgs);
	}

	protected configureApp(): void {
		this.app = this;
	}

	destroy(): void {
		for (var key in this) {
			var component: Destroyable = (<any> this)[key];
			component.destroy && component.destroy();
		}

		super.destroy();
	}

	handleError(error: Error): void {
		var errorHandler = this.errorHandler;
		if (errorHandler) {
			errorHandler.handleError(error);
		}
		else {
			this.log((<any> error).stack || error.message, LogLevel.ERROR, 'error/' + error.name);
		}
	}

	log(message: string, level: LogLevel = LogLevel.LOG, category: string = null): void {
		var logger = this.logger;
		if (logger) {
			logger.log(message, level, category);
		}
		else {
			// TS7017
			(<any> console)[LogLevel[level].toLowerCase()]((category ? category + ': ' : '') + message);
		}
	}

	/**
	 * Starts the application. Once this method has been called, the {@link module:mayhem/Application#components}
	 * property may no longer be modified.
	 *
	 * @returns A promise that is resolved once all application components have loaded and started.
	 */
	run(): Promise<Application> {
		var self = this;
		var components: HashMap<any> = <any> this.components;

		function getConstructors(): Promise<HashMap<ComponentConstructor>> {
			var ctors: HashMap<Promise<ComponentConstructor>> = {};

			for (var key in components) {
				// Author may have disabled a component by setting its value to null/undefined
				if (!components[key]) {
					continue;
				}

				ctors[key] = new Promise<any>(function (resolve, reject) {
					var ctor: Constructor = components[key].constructor;

					if (typeof ctor === 'string') {
						util.getModule(ctor).then(resolve, reject);
					}
					else if (typeof ctor === 'function') {
						resolve(ctor);
					}
					else {
						reject(new Error(`${key}.constructor should be a string or function, not ${typeof ctor}`));
					}
				});
			}

			return Promise.all(ctors);
		}

		function instantiateComponents(ctors: HashMap<ComponentConstructor>): Promise<any> {
			var instance: ApplicationComponent;
			var instances: ApplicationComponent[] = [];
			var startups: Array<void | Promise<any>> = [];

			for (var key in ctors) {
				instance = new ctors[key](<any> lang.mixin({ app: self }, components[key], { constructor: undefined }));
				(<any> self)[key] = instance;
				instances.push(instance);
			}

			while ((instance = instances.shift())) {
				instance.run && startups.push(instance.run());
			}

			return Promise.all(startups);
		}

		var promise = getConstructors()
			.then(instantiateComponents)
			.then(function () {
				return self;
			});

		this.run = function (): Promise<Application> {
			return promise;
		};

		return promise;
	}
}

module Application {
	export interface KwArgs extends Base.KwArgs {
		binder?: typeof Application.prototype.binder;
		components?: typeof Application.prototype.components;
		errorHandler?: typeof Application.prototype.errorHandler;
		i18n?: typeof Application.prototype.i18n;
		scheduler?: typeof Application.prototype.scheduler;
	}
}

export = Application;
