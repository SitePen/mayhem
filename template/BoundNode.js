define([
	'dojo/_base/declare',
	'dojo/dom-construct'
], function (declare, domConstruct) {
	return declare(null, {
		baseFragment: null,

		fragment: null,
		beginMarker: null,
		endMarker: null,

		postscript: function (view, options) {
			options = options || {};
			this._create(view, options);
			this._bind(view, options);
		},

		_create: function (/*view, options*/) {
			// summary:
			//		Create a template node.
			// view:
			// 		The view for which the node is being created.

			var fragment = this.fragment || (this.fragment = document.createDocumentFragment()),
				beginMarker = this.beginMarker = document.createComment('begin-' + this.id),
				endMarker = this.endMarker = document.createComment('end-' + this.id);

			fragment.appendChild(beginMarker);
			fragment.appendChild(endMarker);
		},

		_bind: function (/*view*/) {
			// Do nothing in base class.
		},

		placeAt: function (referenceNode, position) {
			// Remove nodes into the fragment so they can be easily placed.
			this.remove();

			domConstruct.place(this.fragment, referenceNode, position);
		},

		remove: function () {
			// Remove nodes into fragment if they aren't already there.
			if (!this.fragment.contains(this.beginMarker)) {
				var range = document.createRange();
				range.setStartBefore(this.beginMarker);
				range.setEndAfter(this.endMarker);
				this.fragment = range.extractContents();

				// TODO: Support IE8 which doesn't support ranges. The below code should work but hasn't been tested yet.
				/*
				// TODO: Is there a simpler way to do this?
				var beginMarker = this.beginMarker,
					endMarker = this.endMarker,
					lastNode = endMarker.previousSibling;

				domConstruct.place(endMarker, referenceNode, position);

				var destination = endMarker.parentNode,
					currentNode = beginMarker,
					nextSibling;
				do {
					nextSibling = currentNode.nextSibling;
					destination.insertBefore(currentNode, endMarker);
				} while (currentNode !== lastNode && (currentNode = nextSibling));
				*/
			}
		},

		destroy: function () {
			// TODO
		}
	});
});