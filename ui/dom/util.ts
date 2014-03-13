import domConstruct = require('dojo/dom-construct');
import PlacePosition = require('../PlacePosition');

export function toDom(value:any /* string | Node */):Node {
	return domConstruct.toDom(value)
}

export function getRange(start:Node, end:Node, exclusive:boolean = false):Range {
	var range = document.createRange();

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
		range.insertNode(end);
		range.insertNode(start);
	}

	return range;
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
