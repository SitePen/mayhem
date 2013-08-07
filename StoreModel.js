define([
	'dojo/_base/declare',
	'./Model'
], function (declare, Model) {
	return declare(Model, {
		//	store: dojo/store/api/Store
		//		The store to which the object belongs. This is set automatically
		//		when using `framework/store/_ModelledStoreMixin`.
		store: null,

		save: function () {
			//	summary:
			//		Saves this object to its default store.

			var self = this;

			this.inherited(arguments).then(function () {
				if (!self.store) {
					throw new Error('Missing store');
				}

				// Note: When putting to the store, the store *must* call commit on the object once it is successful.
				return self.store.put(self);
			});
		}
	});
});
