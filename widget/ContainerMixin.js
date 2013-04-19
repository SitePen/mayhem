define([
	'dojo/_base/declare',
	'dojo/query',
	'dojo/dom-construct',
	'dojo/dom-attr',
	'dojo/domReady!'
], function (declare, query, domConstruct, domAttr) {

	// NOTE: This is mostly just a sketch.

	var INSERTION_POINT_ATTRIBUTE = 'data-dojo-insertion-point';
	// TODO: Perhaps this should be data-dojo-selection-criteria?
	var SELECTION_CRITERIA_ATTRIBUTE = 'data-dojo-content-select';

	var selectionTestNode = domConstruct.create('div');
	function widgetMeetsSelectionCriteria(widget, selectionCriteria) {
		try {
			// NOTE: A side effect of this approach is that a widget that
			// is already in the DOM will be removed from its current home.
			// I'm not sure yet whether that is something that will occur
			// in practice with these containers.
			selectionTestNode.appendChild(widget.domNode);
			return query(selectionCriteria, selectionTestNode).length > 0;
		}
		finally {
			selectionTestNode.innerHTML = '';
		}
	}

	return declare(null, {
		// _childMap: Object
		//		A map of child widgets by id.
		_childMap: null,

		// _insertionPointNodes: Array
		_insertionPoints: null,

		constructor: function () {
			this._childMap = {};
		},

		postscript: function () {
			this.inherited(arguments);

			this._insertionPoints = query('[' + INSERTION_POINT_ATTRIBUTE + ']', this.domNode);
		},

		// NOTE: This appears to be the interface we require if we're to support ShadowDOM-like insertion points. No more inserting by index.
		//addChild: function (childWidget, positionSpecifier, nodeRef) {
		// Using a simpler interface for an initial append-only implementation
		addChild: function (childWidget) {
			this._addChildToDom(childWidget);
			// TODO: Call child's startup() if we are already started.
			this._childMap[childWidget.id] = childWidget;
		},

		_addChildToDom: function (childWidget) {
			var insertionPoints = this._insertionPoints,
				childDistributed = false;
			for (var i = 0; i < insertionPoints.length && !childDistributed; i++) {
				var selectionCriteria = domAttr.get(insertionPoints[i], SELECTION_CRITERIA_ATTRIBUTE);
				if (!selectionCriteria || widgetMeetsSelectionCriteria(childWidget, selectionCriteria)) {
					insertionPoints[i].appendChild(childWidget.domNode);
					childDistributed = true;
				}
			}

			if (!childDistributed) {
				this.domNode.appendChild(childWidget.domNode);
			}
		},

		_removeChildFromDom: function (childWidget) {
			var domNode = childWidget.domNode,
				parentNode = domNode.parentNode;

			if (parentNode) {
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
			for (var key in this._childMap) {
				if (this.isOwnProperty(key)) {
					perChildCallback(this[key]);
				}
			}
		},

		destroy: function () {
			var container = this;
			this.forEachChild(function (childWidget) {
				container.removeChild(childWidget);
				childWidget.destroy();
			});
			this.inherited(arguments);
		}
	});
});