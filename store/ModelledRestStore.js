define([
	"dojo/_base/declare",
	"dojo/store/JsonRest",
	"dojo/when",
	"dojo/store/util/QueryResults",
	"./_ModelledStoreMixin"
], function (declare, JsonRest, when, createQueryResults, _ModelledStoreMixin) {
	return declare([ JsonRest, _ModelledStoreMixin ], {
		//	summary:
		//		A modelled `dojo/store/JsonRest` store.

		get: function () {
			//	summary:
			//		Ensures objects retrieved from the remote store are
			//		converted to modelled data objects.

			var Model = this.model,
				self = this;

			return this.inherited(arguments).then(function (object) {
				if (Model && !(object instanceof Model)) {
					object = new Model(object);
					object.store = self;
					object.scenario = "update";
				}

				return object;
			});
		},

		query: function () {
			//	summary:
			//		Ensures objects retrieved from the remote store are
			//		converted to modelled data objects.

			var self = this,
				originalResults = this.inherited(arguments),
				results = createQueryResults(when(originalResults).then(function (records) {
					self._processResultSet(records);
					return records;
				}));

			results.total = originalResults.total;
			return results;
		}
	});
});