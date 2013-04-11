define([
	'./Renderers',
	'dbind/bind'
], function (Renderers, bind) {

	function SlotRender(astNode) {
		//	summary:
		//		Manages the rendering and updating of a Slot
		//	astNode:
		//		The AST node that describes this slot

		this.uid = astNode.uid;
	}

	SlotRender.prototype = {
		constructor: SlotRender,

		render: function (context, template) {
			// generate a start and end script block
			var uid = this.uid,
				frag = template.toDom('<script data-uid="' + uid + '-open"></script><script data-uid="' + uid + '-close"></script>'),
				open = frag.firstChild,
				close = frag.lastChild,
				content = template.root.slots[uid];

			// render template.root.slots[this.uid] into this slot
			return bind(function () {
				var parent = open.parentNode,
					nodes = [].slice.call(arguments);

				if (nodes.length) {
					while (nodes.length) {
						template.placeNode(nodes.shift(), close, 'before');
					}
				}
				else {
					while (open.nextSibling !== close) {
						// TODO: should we empty the node?
						parent.removeChild(open.nextSibling);
					}
				}
				return parent;
			}).to(content.render(context, template));
		},

		unrender: function (node) {
			// TODO:
			// find our script tags (by data-uid) and clean up
		},

		destroy: function () {
			// TODO:
		}
	};

	return SlotRender;
});