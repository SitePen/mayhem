/// <reference path="./dojo" />

import array = require('dojo/_base/array');
import aspect = require('dojo/aspect');
import core = require('./interfaces');
import Deferred = require('dojo/Deferred');
import has = require('./has');
import whenAll = require('dojo/promise/all');

export function applyMixins(derivedCtor:any, baseCtors:any[]):void {
	for (var i = 0, baseCtor:Function; (baseCtor = baseCtors[i]); ++i) {
		var prototype = baseCtor.prototype;
		for (var k in prototype) {
			if (prototype[k] !== Object.prototype[k]) {
				derivedCtor.prototype[k] = prototype[k];
			}
		}
	}
}

export function createTimer(callback:(...args:any[]) => void, delay:number = 0):IHandle {
	var timerId:number;
	if (has('raf') && delay === 0) {
		timerId = requestAnimationFrame(callback);
		return {
			remove: function ():void {
				this.remove = function ():void {};
				cancelAnimationFrame(timerId);
				timerId = null;
			}
		};
	}
	else {
		timerId = setTimeout(callback, delay);
		return {
			remove: function ():void {
				this.remove = function ():void {};
				clearTimeout(timerId);
				timerId = null;
			}
		};
	}
}

export function debounce<T extends (...args:any[]) => void>(callback:T, delay:number = 0):T {
	var timer:IHandle;

	return <any>function ():void {
		timer && timer.remove();

		var self:any = this,
			args:IArguments = arguments;

		timer = createTimer(function ():void {
			callback.apply(self, args);
			self = args = timer = null;
		}, delay);
	};
}

export function deferMethods(target:Object, methods:string[], untilMethod:string):void {
	var waiting = {},
		untilHandle = aspect.after(target, untilMethod, function ():void {
			untilHandle.remove();
			untilHandle = null;

			for (var method in waiting) {
				var info = waiting[method];

				target[method] = info.original;
				info.args && target[method].apply(target, info.args);
			}

			target = waiting = null;
		}, true);

	array.forEach(methods, function (method:string):void {
		var info:{ original:Function; args:IArguments; } = waiting[method] = {
			original: target[method],
			args: null
		};

		target[method] = function ():void {
			info.args = arguments;
		};
	});
}

export function deferSetters(target:Object, methods:string[], untilMethod:string):void {
	deferMethods(target, array.map(methods, method => '_' + method + 'Setter'), untilMethod);
}

/**
 * Escapes a string of text for injection into a serialization of HTML or XML.
 */
export function escapeXml(text:string, forAttribute:boolean = false):string {
	text = String(text).replace(/&/g, '&amp;').replace(/</g, '&lt;');

	if (forAttribute) {
		text = text.replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
	}

	return text;
}

export function getModule<T>(moduleId:string):IPromise<T> {
	return getModules([ moduleId ]).then(function (modules:T[]):T {
		return modules[0];
	});
}

export function getModules<T>(moduleIds:string[]):IPromise<T[]> {
	var dfd = new Deferred<T[]>();
	var handle:IHandle;

	if (require.on) {
		var moduleUrls = {};
		for (var i = 0; i < moduleIds.length; i++) {
			moduleUrls[require.toUrl(moduleIds[i])] = moduleIds[i];
		}

		handle = require.on('error', function (error:{ message: string; info:string[]; }):void {
			// TODO: handle plugins correctly
			if (error.message === 'scriptError') {
				var moduleUrl = error.info[0].slice(0, -3);
				if (moduleUrl in moduleUrls) {
					handle && handle.remove();
					handle = null;

					var reportedError = new Error('Couldn\'t load ' + moduleUrls[moduleUrl] + ' from ' + error.info[0]);
					reportedError['info'] = error.info;
					dfd.reject(reportedError);
				}
			}
		});
	}

	require(moduleIds, function (...modules:T[]):void {
		handle && handle.remove();
		handle = null;
		dfd.resolve(modules);
	});

	return dfd.promise;
}

/**
 * Retrieves all enumerable keys from an object.
 */
export var getObjectKeys = has('es5') ? Object.keys : function (object:Object):string[] {
	var keys:string[] = [],
		hasOwnProperty = Object.prototype.hasOwnProperty;

	for (var key in object) {
		hasOwnProperty.call(object, key) && keys.push(key);
	}
	return keys;
};

/**
 * Determines whether two values are strictly equal, also treating
 * NaN as equal to NaN.
 */
export function isEqual(a:any, b:any):boolean {
	return a === b || /* both values are NaN */ (a !== a && b !== b);
}

/**
 * Determines whether or not a value is an Object, in the EcmaScript specification
 * sense of an Object.
 */
export function isObject(object:any):boolean {
	var type:string = typeof object;
	return object != null && (type === 'object' || type === 'function');
}

/**
 * Finds and removes `needle` from `haystack`, if it exists.
 */
export function spliceMatch<T>(haystack:T[], needle:T):boolean {
	for (var i = 0; i < haystack.length; ++i) {
		if (haystack[i] === needle) {
			haystack.splice(i, 1);
			return true;
		}
	}

	return false;
}

export function spread<T, U>(values:IPromise<T>[], resolved:(...args:T[]) => U, rejected?:(error:Error) => void):IPromise<U>;
export function spread<T, U>(values:T[], resolved:(...args:T[]) => U, rejected?:(error:Error) => void):IPromise<U>;
export function spread(values:any[], resolved:(...args:any[]) => any, rejected?:(error:Error) => void):IPromise<any> {
	return whenAll(values).then(function (values:any):any {
		return resolved.apply(undefined, values);
	}, rejected);
}

// TODO: Remove if unused
export function deepMixin<T extends Object>(target:T, source:any):T;
export function deepMixin<T extends Object>(target:any, source:any):T;
export function deepMixin(target:any, source:any):any {
	if (typeof source === 'object' && source !== null) {
		if (source instanceof Array) {
			target.length = source.length;
		}

		for (var name in source) {
			var targetValue = target[name];
			var sourceValue = source[name];

			if (targetValue !== sourceValue) {
				if (typeof sourceValue === 'object' && sourceValue !== null) {
					if (targetValue === null || typeof targetValue !== 'object') {
						target[name] = targetValue = (sourceValue instanceof Array) ? [] : {};
					}
					deepMixin(targetValue, sourceValue);
				}
				else {
					target[name] = sourceValue;
				}
			}
		}
	}

	return target;
}

// TODO: Remove
export function omitKeys(object:any, keys:string[]):any {
	var keyHash:any = {},
		result:any = {};

	for (var i = 0; i < keys.length; i++) {
		keyHash[keys[i]] = 1;
	}

	for (var key in object) {
		if (keyHash.hasOwnProperty(key)) {
			continue;
		}
		result[key] = object[key];
	}

	return result;
}
