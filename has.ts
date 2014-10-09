/// <reference path="./dojo" />

import has = require('dojo/has');

has.add('debug', true);

// Pragmatically, it is not really necessary to check for every individual ES5 interface, since with the exception of
// Function#bind in Safari 5.1.3-, all the supported ES5-compliant browsers implement all the ES5 features we need
// to branch for. `Date.now` just happens to be the shortest new ES5 API, so it is the one that is checked. Shims are
// intentionally excluded since their code paths will effectively be the same as our non-ES5 code paths anyway.
has.add('es5', Date.now && Date.now.toString().indexOf('[native code]') > -1);

has.add('raf', typeof requestAnimationFrame === 'function');

if (typeof window !== 'undefined') {
	var minimumWindowDimension = Math.min(window.innerWidth, window.innerHeight);

	has.add('phone', has('touch') && minimumWindowDimension <= 640);
	has.add('tablet', has('touch') && !has('phone'));
}

if (has('dom')) {
	has.add('dom-tree-walker', typeof document.createTreeWalker !== 'undefined');
	has.add('dom-mspointerevents', 'MsPointerEvent' in window);
	has.add('dom-pointerevents', 'PointerEvent' in window);
	has.add('dom-touch', 'ontouchstart' in document);
	has.add('dom-mouse', 'onmousedown' in document);
	if (has('dom-addeventlistener')) {
		// https://code.google.com/p/chromium/issues/detail?id=276941
		has.add('dom-mouse-buttons', 'buttons' in document.createEvent('MouseEvent'));
		has.add('dom-keyboard-key', 'key' in document.createEvent('KeyboardEvent'));
		has.add('dom-keyboard-keyIdentifier', 'keyIdentifier' in document.createEvent('KeyboardEvent'));
		has.add('dom-keyboard-isComposing', 'isComposing' in document.createEvent('KeyboardEvent'));
		has.add('dom-keyboard-code', 'code' in document.createEvent('KeyboardEvent'));
	}
	has.add('dom-node-interface', typeof Node !== 'undefined');
	has.add('dom-textnode-extensible', function ():boolean {
		try {
			return (<any> document.createTextNode('')).foo = true;
		}
		catch (error) {
			return false;
		}
	});
	has.add('dom-firstchild-empty-bug', function ():boolean {
		var element:HTMLElement = arguments[2];
		element.innerHTML = '<!--foo-->';
		return element.childNodes.length === 0;
	});
}

export = has;
