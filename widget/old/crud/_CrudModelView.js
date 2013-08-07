define([
	"dojo/_base/declare",
	"./_CrudView",
	"../_DataBinding",
	"dojo/date/locale"
], function (declare, _CrudView, _DataBinding, locale) {
	return declare([ _CrudView, _DataBinding ], {
		//	summary:
		//		A templated base widget that can be extended to easily create a
		//		non-editable view for `framework/model/_Model` objects.

		//	model: framework/model/_Model
		//		The model to display.
		model: null,

		_editButton: null,
		_deleteButton: null,

		//	_modelWatchHandle: [private] Handle
		//		Handles for watching properties of the current model.
		_modelWatchHandles: [],

		constructor: function () {
			this._modelWatchHandles = [];
		},

		postCreate: function () {
			this.inherited(arguments);

			if (this._deleteButton) {
				var self = this;
				this.own(this._deleteButton.on("delete", function () {
					self.controller.go("browse", true);
				}));
			}
		},

		_setModelAttr: function (value) {
			//	summary:
			//		Sets the correct URL of the edit button.

			var handle;
			while ((handle = this._modelWatchHandles.pop())) {
				handle.remove();
			}

			this.inherited(arguments);
			this._set("model", value);

			if (this._editButton) {
				var button = this._editButton,
					self = this;

				if (value) {
					button.set("href", "#/" + this.controller.id + "/edit/" + value.id);

					// If the ID of the model changes, the edit button's href must be updated as well
					this._modelWatchHandles.push(value.watch("id", function (name, oldValue, newValue) {
						button.set("href", "#/" + self.controller.id + "/edit/" + newValue);
					}));
				}

				button.domNode.style.display = value ? "" : "none";
			}

			if (this._deleteButton) {
				this._deleteButton.set("model", value);
			}
		},

		_updateBoundNode: function (/*DomNode*/ node, /*string*/ key, /*any*/ value) {
			//	summary:
			//		Provides a formatting extension for Date values within a
			//		bound model.

			// TODO: Do this elsewhere or in a more abstract manner?
			if (value instanceof Date) {
				this.inherited(arguments, [ node, key, locale.format(value) ]);
			}
			else {
				this.inherited(arguments);
			}
		}
	});
});
