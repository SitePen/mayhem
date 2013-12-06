/// <reference path="dojo.d.ts" />

import core = require('./interfaces');
import Stateful = require('dojo/Stateful');
import Evented = require('dojo/Evented');

class StatefulEvented extends Stateful implements IEvented {
  constructor(kwArgs:Object) {
    super(kwArgs);
    Evented.apply(this, arguments);
  }
  on(type:any, listener:(event:Event) => void):IHandle {
    return Evented.prototype.on.apply(this, arguments);
  }
  emit(type:any, event:Event):void {
	Evented.prototype.emit.apply(this, arguments);
  }
}

export = StatefulEvented;
