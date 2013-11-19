/// <reference path="dojo.d.ts" />
define(["require", "exports", 'dojo/has'], function(require, exports, __has__) {
    var has = __has__;

    exports.getObjectKeys = has('es5-object-keys') ? Object.keys : function (object) {
        var keys = [], hasOwnProperty = Object.prototype.hasOwnProperty;

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
    function createSetter(propertyName, childName, childPropertyName) {
        return function (value) {
            this[childName] && this[childName].set(childPropertyName || propertyName, value);
            this._set(propertyName, value);
        };
    }
    exports.createSetter = createSetter;
    ;

    function spliceMatch(haystack, needle) {
        for (var i = 0; i < haystack.length; ++i) {
            if (haystack[i] === needle) {
                haystack.splice(i, 1);
                return;
            }
        }
    }
    exports.spliceMatch = spliceMatch;

    /**
    * Determines whether two values are strictly equal, also treating
    * NaN as equal to NaN.
    */
    function isEqual(a, b) {
        return a === b || (a !== a && b !== b);
    }
    exports.isEqual = isEqual;
});
