import util = require('../../util');

class ClassList {
	private _value:HashMap<boolean>;

	constructor() {
		this._value = {};
	}

	add(className:string):void {
		var classes:string[] = className.split(/\s+/);
		for (var i = 0, j = classes.length; i < j; ++i) {
			if (className) {
				this._value[className] = true;
			}
		}
	}

	has(className:string):boolean {
		return this._value[className] || false;
	}

	remove(className:string):void {
		var classes:string[] = className.split(/\s+/);
		for (var i = 0, j = classes.length; i < j; ++i) {
			className = classes[i];
			if (className) {
				// "slow" object is OK, it should still be faster than holding a string
				// and simplifies implementation
				delete this._value[className];
			}
		}
	}

	set(className:string):void {
		this._value = {};
		this.add(className);
	}

	toggle(className:string, forceState?:boolean):void {
		if (forceState != null) {
			// TS7017
			(<any> this)[forceState ? 'add' : 'remove'](className);
		}
		else {
			var classes:string[] = className.split(/\s+/);

			for (var i = 0, j = classes.length; i < j; ++i) {
				className = classes[i];
				if (this._value[className]) {
					delete this._value[className];
				}
				else {
					this._value[className] = true;
				}
			}
		}
	}

	valueOf():string {
		return util.getObjectKeys(this._value).join(' ');
	}
}

export = ClassList;
