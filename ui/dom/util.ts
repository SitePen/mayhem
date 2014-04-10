/// <reference path="../../dojo" />

import domConstruct = require('dojo/dom-construct');
import PlacePosition = require('../PlacePosition');

export function toDom(value:any /* string | Node */):Node {
	return typeof value === 'string' ? domConstruct.toDom(value) : value;
}

export function extractRange(start:Node, end:Node, exclusive:boolean = false):DocumentFragment {
	var fragment = document.createDocumentFragment(),
		next:Node;

	if (start.parentNode && start.parentNode === end.parentNode) {
		if (exclusive) {
			start = start.nextSibling;
		}

		while (start != end) {
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

export function deleteRange(start:Node, end:Node, exclusive:boolean = false):void {
	if (start.parentNode !== end.parentNode) {
		throw new Error('start and end do not share a parent')
	}

	if (!start.parentNode) {
		// return if nodes have no parent
		return;
	}

	var parent = start.parentNode,
		next:Node;

	if (exclusive) {
		start = start.nextSibling;
	}

	while (start != end) {
		next = start.nextSibling;
		parent.removeChild(start);
		start = next;
	}

	if (!exclusive) {
		parent.removeChild(start);
	}
}

export function place(node:any /* Node | string */, refNode:any /* Node | string */, position:PlacePosition = PlacePosition.LAST):Node {
	return domConstruct.place(node, refNode, PLACE_POSITION_KEYS[position])
}

export var PLACE_POSITION_KEYS:{ [key:string]: string; } = {
	'-1': 'first',
	'-2': 'last',
	'-3': 'before',
	'-4': 'after',
	'-5': 'only',
	'-6': 'replace'
};

export function setStyle(node:HTMLElement, key:string, value:any):void {
	if (value == null) {
		value = '';
	}
	else if (typeof value === 'number' && value !== 0) {
		value += 'px';
	}

	node.style[<any> key] = value;
}
