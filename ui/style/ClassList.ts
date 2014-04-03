/// <reference path="../../dojo" />

import lang = require('dojo/_base/lang');
import Proxty = require('../../Proxty');
import style = require('./interfaces');

class ClassList extends Proxty<string> implements style.IClassList {
	static parse(value:any):string[] {
		return typeof value === 'string' ? lang.trim(value).split(/\s+/g) : value;
	}

	constructor(initialValue?:string) {
		super(initialValue || '');
	}

	add(value:any):void {
		var classes = ClassList.parse(value),
			classList:string = this.get(),
			className:string;

		for (var i = 0; (className = classes[i]); ++i) {
			if (!this.has(className)) {
				classList += ' ' + className;
			}
		}

		this.set(lang.trim(classList));
	}

	has(value:any):boolean {
		var classes = ClassList.parse(value),
			classList:string = ' ' + this.get() + ' ',
			className:string;

		for (var i = 0; (className = classes[i]); ++i) {
			if (classList.indexOf(' ' + className + ' ') === -1) {
				return false;
			}
		}

		return true;
	}

	remove(value:any):void {
		if (!value || !value.length) {
			return;
		}
		var classes = ClassList.parse(value),
			classList:string = ' ' + this.get() + ' ',
			className:string;

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
			var classes = ClassList.parse(className);

			for (var i = 0; (className = classes[i]); ++i) {
				this.has(className) ? this.remove(className) : this.add(className);
			}
		}
	}
}

export = ClassList;
