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

/**
 * Creates a simple _setXXXAttr function to map a widget property to the property of an object on the widget.
 * TODO: This is not relevant to the new widget API and should be removed.
 * @param propertyName
 * The name of the property being mapped.
 * @param childName
 * The name of the property containing the child object to map.
 * @param childPropertyName
 * An optional alternative property name to set on the child.
 * If not provided, `propertyName` is set on the child instead.
 */
export function createSetter(propertyName:string, childName:string, childPropertyName?:string):Function {
	return function (value:any):void {
		this[childName] && this[childName].set(childPropertyName || propertyName, value);
		this._set(propertyName, value);
	};
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
 * Cleans up any provided destroyables.
 */
export function destroy(...targets:core.IDestroyable[]):void {
	for (var i = 0, target:core.IDestroyable; (target = targets[i]); ++i) {
		target.destroy();
		target.destroy = function ():void {};
	}
	targets = null;
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

var toString = Object.prototype.toString;
/**
 * Determines whether a value is an Array. This is equivalent to `Array.isArray()`
 * in ES5
 */
export function isArray(object:any):boolean {
	return toString.call(object) === '[object Array]';
}

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
 * Cleans up any provided handles.
 */
export function remove(...handles:IHandle[]):void {
	for (var i = 0, handle:IHandle; (handle = handles[i]); ++i) {
		handle.remove();
	}
	handle = null;
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

export function deepMixin<T extends Object>(target:T, source:any):T;
export function deepMixin<T extends Object>(target:any, source:any):T;
export function deepMixin(target:any, source:any):any {
	if (source && typeof source === 'object') {
		if (source instanceof Array) {
			(<any>target).length = source.length;
		}
		for (var name in source) {
			var targetValue = target[name],
				sourceValue = source[name];

			if (targetValue !== sourceValue) {
				if (sourceValue && typeof sourceValue === 'object') {
					if (!targetValue || typeof targetValue !== 'object') {
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

export function applicationGetters(Ctor:Function, keys:string[]):void {
	array.forEach(keys, (key:string):void => {
		Ctor.prototype['_' + key + 'Getter'] = function ():string {
			var app:core.IApplication = this._app || this.get('app');

			if (app === this) {
				// Application and subclasses
				return this['_' + key];
			}
			else {
				return app.get(key);
			}
		};
	});
}

declare var global:any;

var globalObject:any;
if (typeof window !== 'undefined') {
	globalObject = window;
}
else if (typeof global !== 'undefined') {
	globalObject = global;
}

export function getModule(moduleId:string):IPromise<any> {
	return getModules([moduleId]).then(():any => arguments[0]);
}

export function getModules(moduleIds:string[]):IPromise<any[]> {
	var dfd = new Deferred<any[]>(),
		handle:IHandle;

	if (globalObject.require.on) {
		var moduleUrls = {};
		for (var i = 0; i < moduleIds.length; i++) {
			moduleUrls[globalObject.require.toUrl(moduleIds[i])] = moduleIds[i];
		}

		// TODO: this should probably be handled in one global handler
		handle = globalObject.require.on('error', function (error:any):void {
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

	globalObject.require(moduleIds, function (modules:any[]):void {
		handle && handle.remove();
		dfd.resolve(modules);
	});

	return dfd.promise;
}

export function spread<T, U>(values:IPromise<T>[], resolved:(...args:T[]) => U, rejected?:(error:Error) => void):IPromise<U>;
export function spread<T, U>(values:T[], resolved:(...args:T[]) => U, rejected?:(error:Error) => void):IPromise<U>;
export function spread(values:any[], resolved:(...args:any[]) => any, rejected?:(error:Error) => void):IPromise<any> {
	return whenAll(values).then(
		function (values:any):any {
			return resolved.apply(undefined, values);
		},
		rejected
	);
}
