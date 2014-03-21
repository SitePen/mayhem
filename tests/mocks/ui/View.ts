class MockView {
	_added:any = null;
	_properties:any = {};
	_destroyed = false;
	_bindArgs:any;
	_bindingRemoved = false;

	constructor() {
		console.log('creating a mock view');
	}

	add(widget:any, position?:any) {
		this._added = {
			widget: widget,
			position: position
		};
	}

	set(key:string, value:any) {
		this._properties[key] = value;

		var self:any = this,
			setter = '_' + key + 'Setter'; 
		if (setter in this) {
			var args = Array.prototype.slice.call(arguments, 1);
			self[setter].apply(this, args);
		}
	}

	get(key:string):any { 
		return this._properties[key];
	}

	destroy() {
		this._destroyed = true;
	}

	detach() {
	}

	on() {
	}

	bind(bindArgs:any) {
		var self = this;
		this._bindArgs = bindArgs;
		return {
			remove() {
				self._bindingRemoved = true;
			}
		}
	}
}
export = MockView;
