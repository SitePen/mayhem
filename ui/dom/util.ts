/// <reference path="../../dojo" />

import has = require('../../has');

has.add('dom-range', Boolean(typeof document !== 'undefined' && document.createRange));

export function extractContents(start:Node, end:Node, exclusive:boolean = false):DocumentFragment {
	if (has('dom-range')) {
		var range:Range = document.createRange();

		if (start.parentNode && end.parentNode) {
			if (exclusive) {
				range.setStartAfter(start);
				range.setEndBefore(end);
			}
			else {
				range.setStartBefore(start);
				range.setEndAfter(end);
			}
		}
		else {
			// TODO: what does this mean?
			// point range at the end of the document (it has to point within the document nodes can be inserted)
			range.setStartAfter(document.body.lastChild);
			range.setEndAfter(document.body.lastChild);
			range.insertNode(end);
			range.insertNode(start);
		}

		return range.extractContents();
	}
	else {
		var fragment = document.createDocumentFragment();
		var next:Node;

		if (start.parentNode && start.parentNode === end.parentNode) {
			if (exclusive) {
				start = start.nextSibling;
			}

			while (start !== end) {
				next = start.nextSibling;
				fragment.appendChild(start);
				start = next;
			}

			if (!exclusive) {
				fragment.appendChild(start);
			}
		}
		else {
			fragment.appendChild(start);
			fragment.appendChild(end);
		}

		return fragment;
	}
}
