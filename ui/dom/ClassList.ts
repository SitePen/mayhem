import lang = require('dojo/_base/lang');
import Proxty = require('../../Proxty');
import widgets = require('../interfaces');

class DomClassList extends Proxty<string> implements widgets.IClassList {
	private _widget:widgets.IDomWidget;

	constructor(widget:widgets.IDomWidget) {
		this._widget = widget;
		super('');
	}

	add(className:string):void {
		var classes:string[] = lang.trim(className).split(/\s+/g),
			classList:string = this.get();

		for (var i = 0; (className = classes[i]); ++i) {
			if (!this.has(className)) {
				classList += ' ' + className;
			}
		}

		this.set(classList);
	}

	has(className:string):boolean {
		var classes:string[] = lang.trim(className).split(/\s+/g),
			classList:string = ' ' + this.get() + ' ';

		for (var i = 0; (className = classes[i]); ++i) {
			if (classList.indexOf(' ' + className + ' ') === -1) {
				return false;
			}
		}

		return true;
	}

	remove(className:string):void {
		var classes:string[] = lang.trim(className).split(/\s+/g),
			classList:string = ' ' + this.get() + ' ';

		for (var i = 0; (className = classes[i]); ++i) {
			classList = classList.replace(' ' + className + ' ', ' ');
		}

		this.set(lang.trim(classList));
	}

	set(className:string):void {
		if (this._widget.firstNode === this._widget.lastNode) {
			(<HTMLElement> this._widget.firstNode).className = className;
		}
		else {
			var node:HTMLElement = <HTMLElement> <any> this._widget.firstNode;

			do {
				if (node.className) {
					node.className = className;
				}
			}
			while ((node = <HTMLElement> <any> node.nextSibling) && node !== this._widget.lastNode);
		}

		super.set(className);
	}

	toggle(className:string, forceState?:boolean):void {
		if (forceState != null) {
			this[forceState ? 'add' : 'remove'](className);
		}
		else {
			var classes:string[] = lang.trim(className).split(/\s+/g);

			for (var i = 0; (className = classes[i]); ++i) {
				this.has(className) ? this.remove(className) : this.add(className);
			}
		}
	}
}

export = DomClassList;
