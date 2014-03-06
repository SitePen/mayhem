/// <reference path="./dojo" />

import array = require('dojo/_base/array');
import aspect = require('dojo/aspect');
import core = require('./interfaces');
import has = require('./has');

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

export function destroyHandles(handles:IHandle[]):void {
	if (!handles) {
		return;
	}
	for (var i = 0, l = handles.length; i < l; ++i) {
		handles[i] && handles[i].remove();
	}
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
