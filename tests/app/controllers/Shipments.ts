import Controller = require('framework/Controller');
import Mediator = require('framework/data/Mediator');
import util = require('framework/util');

class Shipment extends Controller {
	constructor(kwArgs:any = {}) {
		util.deferSetters(this, ['model'], '_viewSetter');

		super(kwArgs);
	}

	_modelSetter(value:any):void {
		super._modelSetter(value);

		this.get('view').set('mediator', new Mediator({
			model: value
		}));
	}
}

export = Shipment;
