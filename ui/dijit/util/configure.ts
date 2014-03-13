import dijit = require('../interfaces');
import DijitConfiguration = require('./Configuration');

function configure(Target:any, config?:any):void {
	Target.prototype.__dijitConfig = new DijitConfiguration(config);
}

export = configure;
