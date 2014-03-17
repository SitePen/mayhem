import dijit = require('./interfaces');
import Observable = require('../../Observable');

class _Mixin extends Observable implements dijit.IMixin {
	/* protected */ _dijitConfig:dijit.IDijitConfiguration;

	get:dijit.IMixinGet;
	set:dijit.IMixinSet;
}

export = _Mixin;
