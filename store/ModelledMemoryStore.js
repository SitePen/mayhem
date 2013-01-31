define([
	"dojo/_base/declare",
	"dojo/store/Memory",
	"./_ModelledStoreMixin",
	"./util/SimpleQueryEngine"
], function (declare, Memory, _ModelledStoreMixin, SimpleQueryEngine) {
	return declare([ Memory, _ModelledStoreMixin ], {
		//	summary:
		//		A modelled `dojo/store/Memory` store.

		queryEngine: SimpleQueryEngine,

		setData: function (data) {
			//	summary:
			//		Ensures objects set in the store are of the correct type
			//		and have a correct reference to this store.

			this._processResultSet(data);
			this.inherited(arguments);
		}
	});
});