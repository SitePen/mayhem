class Mediator {
	static constructed:Mediator[] = [];
	_properties:any = {};
	_kwArgs:any;
	_notifications:any[] = [];
	_destroyed = false;
	_removed = false;

	constructor(kwArgs?:any) {
		this._kwArgs = kwArgs;
		Mediator.constructed.push(this);
	}

	_notify(newValue:any, oldValue:any, key:string) {
		this._notifications.push([ newValue, oldValue, key ]);
	}

	destroy() {
		this._destroyed = true;
	}

	get(key:string):any {
		return this._properties[key];
	}

	set(key:string, value:any) {
		return value;
	}

	remove() {
		this._removed = true;
	}
}
export = Mediator
