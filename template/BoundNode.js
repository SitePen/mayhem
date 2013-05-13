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
			this._bind(view);
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

		_bind: function (/*view*/) {
			// Do nothing in base class.
		},

		placeAt: function (referenceNode, position) {
			// If the fragment has already been placed, extract the range back into the fragment.
			if (!this.fragment.contains(this.beginMarker)) {
				var range = document.createRange();
				range.setStartBefore(this.beginComment);
				range.setEndAfter(this.endComment);
				this.fragment = range.extractContents();

				// TODO: Support IE8 which doesn't support ranges. The below code should work but hasn't been tested yet.
				/*
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
				*/
			}

			domConstruct.place(this.fragment, referenceNode, position);
		},
		destroy: function () {
			// TODO
		}
	});
});