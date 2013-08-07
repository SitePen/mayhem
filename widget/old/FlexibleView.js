define([
	"dojo/_base/declare",
	"dojo/dom-geometry",
	"dojox/mobile/View",
	"dijit/layout/_LayoutWidget",
	"dijit/registry"
], function (declare, domGeometry, View, _LayoutWidget, registry) {
	return declare([ View, _LayoutWidget ], {
		//	summary:
		//		A `dojox/mobile/View` extension that works like a simplified
		//		`dijit/layout/BorderContainer` to allow the view to take up
		//		the entire screen with one element that is flexible.

		//	flexAt: string|number|DomNode|_WidgetBase
		//		The element that should be made flexible within the view's
		//		`containerNode`. Can be "first" for the first element, "last"
		//		for the last element, "none" to make the layout inflexible,
		//		a number that corresponds to the correct element's position
		//		within the `containerNode`, a reference to a widget that sits
		//		directly within the `containerNode`, a DOM node that sits
		//		directly within the `containerNode`, or the name of a property
		//		on `this` that references a widget or DOM node.
		flexAt: "last",

		layout: function () {
			//	summary:
			//		Lays out the children of this View.

			var children = this.containerNode.children,
				flexAt = this.flexAt,
				flexNode;

			if (flexAt === "none" || !this.domNode.parentNode) {
				return;
			}
			else if (flexAt === "first") {
				flexNode = children[0];
			}
			else if (flexAt === "last") {
				flexNode = children[children.length - 1];
			}
			else if (typeof flexAt === "number") {
				flexNode = children[flexAt];
			}
			else {
				flexNode = this[flexAt] ? this[flexAt].domNode || this[flexAt] : flexAt;
			}

			if (!flexNode) {
				console.warn(this.id + " is trying to use a flex node that does not exist");
				return;
			}

			var flexHeight = this._getFlexHeight();

			for (var i = 0, child; (child = children[i]); ++i) {
				if (child !== flexNode) {
					flexHeight -= domGeometry.getMarginBox(child).h;
				}
			}

			if (flexHeight < 0) {
				console.warn("Too much content on " + this.id + " to flex");
				flexHeight = 0;
			}

			var flexWidget = registry.byNode(flexNode);
			if (flexWidget && flexWidget.resize) {
				flexWidget.resize({ h: flexHeight });
			}
			else {
				domGeometry.setMarginBox(flexNode, { h: flexHeight });
			}
		},

		_getFlexHeight: function () {
			return window.innerHeight;
		}
	});
});
