/// <reference path="dojo.d.ts" />

import has = require('./has');

export var getObjectKeys = has('es5') ? Object.keys : function (object:Object):string[] {
	var keys = [],
		hasOwnProperty = Object.prototype.hasOwnProperty;

	for (var key in object) {
		hasOwnProperty.call(object, key) && keys.push(key);
	}
	return keys;
};

/**
 * Creates a simple _setXXXAttr function to map a widget property to the property of an object on the widget.
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
};

export function spliceMatch(haystack:any[], needle:any) {
	for (var i = 0; i < haystack.length; ++i) {
		if (haystack[i] === needle) {
			haystack.splice(i, 1);
			return;
		}
	}
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
