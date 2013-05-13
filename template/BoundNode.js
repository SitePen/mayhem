define([
	'dojo/_base/declare',
	'dojo/dom-construct'
], function (declare, domConstruct) {
	return declare(null, {
		baseFragment: null,

		fragment: null,
		beginComment: null,
		endComment: null,

		postscript: function (view) {
			this._create(view);
		},

		_create: function (/*view*/) {
			// summary:
			//		Create a template node.
			// view:
			// 		The view for which the node is being created.

			var fragment = this.fragment = this.templateFragment.cloneNode(true),
				beginComment = document.createComment('begin-' + this.id),
				endComment = document.createComment('end-' + this.id);

			fragment.appendChild(beginComment);
			fragment.appendChild(endComment);
		},
		placeAt: function (referenceNode, position) {
			var fragment = this.fragment;
			if (fragment.contains(this.beginMarker)) {
				// This instance's fragment has not yet been placed.
				domConstruct.place(fragment, referenceNode, position);
			}
			else {
				// This instance's nodes are already in the DOM. Move them.

				// TODO: Is there a simpler way to do this?

				var beginComment = this.beginComment,
					endComment = this.endComment,
					lastNode = endComment.previousSibling;

				domConstruct.place(endComment, referenceNode, position);

				var destination = endComment.parentNode,
					currentNode = beginComment,
					nextSibling;
				do {
					nextSibling = currentNode.nextSibling;
					destination.insertBefore(currentNode, endComment);
				} while (currentNode !== lastNode && (currentNode = nextSibling));
			}
		},
		destroy: function () {
			// TODO
		}
	});
});