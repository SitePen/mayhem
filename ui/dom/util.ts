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

export function setStyle(node:HTMLElement, key:string, value:any):void {
	if (value == null) {
		value = '';
	}
	else if (typeof value === 'number' && value !== 0) {
		value += 'px';
	}

	node.style[<any> key] = value;
}
