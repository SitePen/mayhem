define([
	'dojo/_base/declare',
	'dojo/when'
], function (declare, when) {
	return declare(null, {
		//	summary:
		//		A store mixin that ensures that all objects within the store are
		//		the correct modelled object type.

		//	model: Function
		//		The constructor to use when converting plain objects returned by
		//		the parent store into actual JavaScript objects.
		model: null,

		createModel: function (/**Object*/ kwArgs) {
			var Model = this.model;
			if (!Model) {
				throw new Error('Cannot create new model');
			}

			var model = new Model(kwArgs);
			model.store = this;
			return model;
		},

		put: function (object) {
			//	summary:
			//		Ensures objects put to the store are of the correct type,
			//		and commits their state once saved successfully.

			var Model = this.model;
			if (Model && !(object instanceof Model)) {
				throw new Error('Objects put to modelled store must be an instance of the defined model');
			}

			var returnValue = this.inherited(arguments);
			when(returnValue).then(function () {
				object.commit();
			});
			return returnValue;
		},

		_processResultSet: function (/*Object[]*/ data) {
			//	summary:
			//		Processes an array of results so that all objects within the
			//		array are modelled objects.

			var Model = this.model;

			if (Model) {
				for (var i = 0, object; (object = data[i]); ++i) {
					if (!(object instanceof Model)) {
						object = new Model(object);
					}
					object.store = this;
					object.scenario = 'update';
					data[i] = object;
				}
			}
		}
	});
});
