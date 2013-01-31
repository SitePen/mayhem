define([], function () {
	return {
		//	summary:
		//		Common utility functions.

		createSetter: function (/*string*/ propertyName, /*string*/ childName, /*string?*/ childPropertyName) {
			//	summary:
			//		Creates a simple _setXXXAttr function to map a widget
			//		property to the property of an object on the widget.
			//	propertyName:
			//		The name of the property being mapped.
			//	childName:
			//		The name of the property containing the child object to map.
			//	childPropertyName:
			//		An optional alternative property name to set on the child.
			//		If not provided, `propertyName` is set on the child instead.

			return function (value) {
				this[childName] && this[childName].set(childPropertyName || propertyName, value);
				this._set(propertyName, value);
			};
		}
	};
});