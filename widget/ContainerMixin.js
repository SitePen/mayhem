define([
	"dojo/_base/declare",
	"dojo/query"
], function (declare, query) {

	// NOTE: This is mostly just a sketch.

	return declare(null, {
		// _childMap: Object
		//		A map of child widgets by id.
		_childMap: null,

		// _insertionPointNodes: Array
		_insertionPoints: null,

		constructor: function () {
			this._childMap = {};
		},

		// NOTE: This appears to be the interface we require if we're to support ShadowDOM-like insertion points. No more inserting by index.
		addChild: function (childWidget, positionSpecifier, nodeRef) {
			this._addChildToDom(childWidget);
			// TODO: Call child's startup()?
			this._childMap[childWidget.id] = childWidget;
		},

		_addChildToDom: function (childWidget) {

			// TODO: ROUGH IDEA: query for insertion points identified by a data-dojo-insertion-point attribute
			// and distribute children according to the selection criteria specified in a data-dojo-select attribute.

			this.domNode.appendChild(childWidget.domNode);
		},

		_removeChildFromDom: function(childWidget) {
			var domNode = childWidget.domNode,
				parentNode = domNode.parentNode;

			if(parentNode) {
				parentNode.removeChild(domNode);
			}
		},

		removeChild: function (childWidget) {
			var childMap = this._childMap,
				id = childWidget.id;

			if (!childMap[id]) {
				throw new Error('No child found with id ' + id);
			}

			this._removeChildFromDom(childWidget);
			delete childMap[id];
		},

		// NOTE: I'm not sure it is necessary or desirable to support external iteration of child widgets.
		forEachChild: function (perChildCallback) {
			for(var key in this) {
				if(this.isOwnProperty(key)) {
					itemCallback(this[key]);
				}
			}
		},

		destroy: function() {
			var container = this;
			this.forEachChild(function(childWidget) {
				container.removeChild(childWidget);
				childWidget.destroy();
			});
			this.inherited(arguments);
		}
	});
});