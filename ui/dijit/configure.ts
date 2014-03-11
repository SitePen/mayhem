import dijit = require('./interfaces');
import lang = require('dojo/_base/lang');

function configure(Target:any, config?:any):void {
	Target.prototype.__dijitConfig = new DijitConfiguration(config);
}

class DijitConfiguration {
	Base:any;
	Dijit:typeof dijit._IWidgetBase;
	schema:any;
	mixins:any[];
	rename:any;

	constructor(config:any = {}) {
		this.Base = config.Base;
		var mixins:any[] = this.mixins = config.mixins;

		// Get Dijit constructor from self, mixins, or Base
		this.Dijit = config.Dijit;
		if (!this.Dijit && mixins) {
			var mixin:any,
				Dijit:any;
			for (var i = 0; (mixin = mixins[i]); ++i) {
				Dijit = this.getConfigProperty('Dijit', mixin);
				if (Dijit) {
					this.Dijit = Dijit;
					break;
				}
			}
		}
		this.Dijit || (this.Dijit = this.getConfigProperty('Dijit'));

		// Set up schema inheritance -- add mixin schemas to own schema, then delegate to Base
		var schema = lang.mixin({}, config.schema);
		if (mixins) {
			var i = mixins.length,
				mixin:any;
			while (mixin = mixins[--i]) {
				lang.mixin(schema, this.getConfigProperty('schema', mixin));
			}
		}
		var baseSchema = this.getConfigProperty('schema');
		this.schema = baseSchema ? lang.delegate(baseSchema, schema) : schema;

		// Set up property rename inheritance
		var baseRename = this.getConfigProperty('rename');
		this.rename = baseRename ? lang.delegate(baseRename, config.rename) : config.rename || {};
	}

	getConfigProperty(property:string, base:any = this.Base):any {
		return base && base.prototype.__dijitConfig[property];
	}
}

export = configure;
