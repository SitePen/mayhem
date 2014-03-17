import dijit = require('../interfaces');
import lang = require('dojo/_base/lang');
import ui = require('../../interfaces');

class DijitConfiguration implements dijit.IDijitConfiguration {
	Base:any/*typeof ui.IWidget*/;
	Dijit:typeof dijit._WidgetBase;
	layoutSchema:any;
	mixins:any/*Array<typeof ui.IWidget>*/;
	rename:any;
	Root:typeof dijit._WidgetBase;
	schema:any;

	constructor(config:any = {}) {
		// Keep a reference to Base class, if any, and Root
		var Base = this.Base = config.Base,
			mixins:any[] = this.mixins = config.mixins,
			baseConfig:DijitConfiguration = this.getConfig(Base) || <DijitConfiguration> {};
		if (Base) {
			this.Root = baseConfig.Root || Base;
		}

		// Get Dijit constructor from self, mixins, or Base
		this.Dijit = config.Dijit;
		if (!this.Dijit && mixins) {
			var mixin:any,
				Dijit:any;
			for (var i = 0; (mixin = mixins[i]); ++i) {
				Dijit = this.getConfig(mixin).Dijit;
				if (Dijit) {
					this.Dijit = Dijit;
					break;
				}
			}
		}
		this.Dijit || (this.Dijit = baseConfig.Dijit);

		// Set up schema inheritance -- add mixin schemas to own schema, then delegate to Base
		var schema = lang.mixin({}, config.schema);
		if (mixins) {
			var i = mixins.length,
				mixin:any/*typeof ui.IWidget*/;
			while (mixin = mixins[--i]) {
				lang.mixin(schema, this.getConfig(mixin).schema);
			}
		}
		var baseSchema = baseConfig.schema;
		this.schema = this._normalize(baseSchema ? lang.delegate(baseSchema, schema) : schema);

		// If child schema exists add its properties to the root schema (on _WidgetBase)
		if (config.layoutSchema) {
			this.layoutSchema = this._normalize(config.layoutSchema);
			lang.mixin(this.getConfig(this.Root).schema, this.layoutSchema);
		}

		// Set up property rename inheritance
		var baseRename = baseConfig.rename;
		this.rename = baseRename ? lang.delegate(baseRename, config.rename) : config.rename || {};
	}

	getConfig(target:any):DijitConfiguration {
		return target && target.prototype._dijitConfig;
	}

	getRequiredFields():string[] {
		var schema = this.schema,
			fields:string[] = [];
		for (var key in schema) {
			if (schema[key].required) {
				fields.push(key);
			}
		}
		return fields;
	}

	private _normalize(schema:any):any {
		var value:any;
		for (var key in schema) {
			value = schema[key];
			if (!value.type) {
				schema[key] = { type: value };
			}
		}
		return schema;
	}
}

export = DijitConfiguration;
