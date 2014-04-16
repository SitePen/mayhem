/// <reference path="../dojo.d.ts"/>

import array = require('dojo/_base/array');
import lang = require('dojo/_base/lang');
import objectQueryEngine = require('dstore/objectQueryEngine');

class ModelMixin {
	idProperty:string;
	queryEngine:dstore.IQueryEngine;

	static load(id:string, contextRequire:Function, loaded:Function):void {
		var ParentCtor = (<any>this).result;
		contextRequire([id], (Model:Function):void => {
			function Store():void {
				ParentCtor.apply(this, arguments);
			}
			Store.prototype = lang.delegate(ParentCtor.prototype, {
				model: Model
			});
			loaded(Store);
		});
	}

	static mixin(Ctor:Function):void {
		var proto = this.prototype,
			queryEngine:dstore.IQueryEngine;

		if (!Ctor.prototype.queryEngine) {
			queryEngine = proto.queryEngine;
			proto.queryEngine = null;
		}

		lang.mixin(Ctor.prototype, proto);

		if (queryEngine) {
			proto.queryEngine = queryEngine;
		}

		(<typeof ModelMixin>Ctor).load = this.load;
	}

	getIdentity(item:any):any {
		return item.get(this.idProperty);
	}

	_setIdentity(item:any, identity:any):any {
		item.set(this.idProperty, identity);
		return item.get(this.idProperty);
	}
}

ModelMixin.prototype.queryEngine = lang.delegate(objectQueryEngine, {
	filter: function(query:any):(data:any[]) => any[] {
		var queryer:any;
		if (typeof query === 'object' || typeof query === 'undefined') {
			queryer = function (object:any):boolean {
				for (var key in query) {
					var required = query[key],
						value:any = object.get(key);
					if (required && required.test) {
						// an object can provide a test method, which makes it work with regex
						if (!required.test(value, object)) {
							return false;
						}
					} else if (required !== value) {
						return false;
					}
				}
				return true;
			};
		}
		else if (typeof query === 'string') {
			// named query
			queryer = this.get(query);
			if (!queryer) {
				throw new Error('No filter function ' + query + ' was found in store');
			}
		}
		if (queryer) {
			return function (data:any[]):any[] {
				return array.filter(data, queryer);
			};
		}
		return objectQueryEngine.filter.apply(this, arguments);
	},

	sort: function (sorted:any):(data:any[]) => any[] {
		return function (data:any):any[] {
			data = data.slice();
			data.sort(typeof sorted === 'function' ? sorted : function (a:any, b:any):number {
				for (var i = 0; i < sorted.length; i++) {
					var comparison:number;
					if (typeof sorted[i] === 'function') {
						comparison = sorted[i](a, b);
					} else {
						var property = sorted[i].property;
						var descending = sorted[i].descending;
						var aValue = a.get(property);
						var bValue = b.get(property);

						comparison = aValue === bValue
							? 0
							: (!!descending === (aValue === null || aValue > bValue) ? -1 : 1);
					}

					if (comparison !== 0) {
						return comparison;
					}
				}
				return 0;
			});
			return data;
		};
	}
});

export = ModelMixin;
