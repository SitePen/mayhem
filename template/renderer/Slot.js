define([
	'./Renderers',
	'dbind/bind',
	'dojo/dom-construct'
], function (Renderers, bind, domConstruct) {

	function SlotRenderer(astNode) {
		//	summary:
		//		Manages the rendering and updating of a Slot
		//	astNode:
		//		The AST node that describes this slot

		this.uid = astNode.uid;
	}

	SlotRenderer.prototype = {
		constructor: SlotRenderer,

		render: function (view, context, template) {
			//	summary:
			//		Render open and close script blocks that are our pseudo range elements.  The
			//		rendering generated by the renderer associated with this slot will be placed
			//		between the open and close script blocks.

			// generate a start and end script block
			var uid = this.uid,
				frag = domConstruct.toDom('<script data-uid="' + uid + '-open"></script><script data-uid="' + uid + '-close"></script>'),
				open = frag.firstChild,
				close = frag.lastChild,
				// find the renderer that occupies this slot
				content = template.root.slots[uid];

			// render the content into this slot
			return bind(function () {
				var parent = open.parentNode,
					nodes = [].slice.call(arguments);

				if (nodes.length) {
					while (nodes.length) {
						// since the closing tag is a known reference point, start at the beginning
						// of the list of nodes and insert each one before the close script.
						domConstruct.place(nodes.shift(), close, 'before');
					}
				}
				else {
					// TODO: should we be doing this every time even when we have nodes to add?
					while (open.nextSibling !== close) {
						// TODO: should we empty the removed node?
						parent.removeChild(open.nextSibling);
					}
				}
				return parent;
			}).to(content.render.apply(content, arguments));
		},

		unrender: function (node) {
			// TODO:
			// find our script tags (by data-uid) and clean up
		},

		destroy: function () {
			// TODO:
		}
	};

	return SlotRenderer;
});