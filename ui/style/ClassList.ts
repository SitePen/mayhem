import lang = require('dojo/_base/lang');
import Proxty = require('../../Proxty');
import style = require('./interfaces');

class ClassList extends Proxty<string> implements style.IClassList {
	constructor(initialValue:string = '') {
		super(initialValue);
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

export = ClassList;
