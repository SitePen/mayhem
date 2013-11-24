/// <reference path="interfaces.ts" />

import Stateful = require('dojo/Stateful');
import Evented = require('dojo/Evented');

class Component extends Stateful implements IComponent, IEvented {
	app:IApplication;
	on;
	emit;
	constructor(kwArgs:Object) {
		super(kwArgs);
		Evented.apply(this, arguments);
	}
}
Component.prototype.on = Evented.prototype.on;
Component.prototype.emit = Evented.prototype.emit;
