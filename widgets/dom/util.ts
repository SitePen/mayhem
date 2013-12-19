export function getRange(start:Node, end:Node, exclusive:boolean = false):Range {
	var range = document.createRange();
	if (exclusive) {
		range.setStartAfter(start);
		range.setEndBefore(end);
	}
	else {
		range.setStartBefore(start);
		range.setEndAfter(end);
	}

	return range;
}
