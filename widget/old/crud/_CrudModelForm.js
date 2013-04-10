define([
	"dojo/_base/declare",
	"dojo/_base/lang",
	"dojo/dom-construct",
	"dojo/dom-class",
	"dojo/on",
	"dojo/router",
	"dojo/when",
	"./_CrudModelView",
	"dijit/form/_FormMixin"
], function (declare, lang, domConstruct, domClass, on, router, when, _CrudModelView, _FormMixin) {
	return declare([ _CrudModelView, _FormMixin ], {
		//	summary:
		//		A base widget that can be extended to easily create a form for
		//		updating `framework/model/_Model` objects.

		//	_fieldLabels: [protected] Object
		//		A hash map of field identifiers to labels. Used to display
		//		human-readable names in validation messages.
		_fieldLabels: {},

		_setModelAttr: function (value) {
			//	summary:
			//		Ensures that form fields are updated when the model is set.

			this._getDescendantFormWidgets().forEach(this._clearErrors);
			this.set("value", value);
			this.inherited(arguments);
		},

		_setValueAttr: function (value) {
			//	summary:
			//		Ensures Date form values are set correctly.

			value = lang.delegate(value);

			for (var k in value) {
				if (value[k] instanceof Date) {
					value[k] = value[k].toISOString();
				}
			}

			this.inherited(arguments, [ value ]);
		},

		_cancel: function () {
			//	summary:
			//		Cancels editing of the model and returns the user to
			//		the previous (detail) view.

			var model = this.get("model");
			model.revert();

			// dojox/mobile form fields reset to blank, so explicitly re-set
			// the values to whatever is stored in the model instead
			this.set("value", model);

			this.controller.go(model.id ? "detail/" + model.id : "browse");
		},

		_save: function () {
			//	summary:
			//		Validates and saves the model. If successful, returns
			//		the user to the previous (detail) view.

			var model = this.get("model");

			model.set(this.get("value"));

			if (!this._validate(model)) {
				model.revert();
				return;
			}

			var self = this;
			when(model.save()).then(function () {
				// Just in case any of the values in the model were changed
				// during validation, we want to re-update the form with them
				self.set("model", model);

				self.controller.go(model.id ? "detail/" + model.id : "browse");
			});
		},

		_clearErrors: function (/*dijit/_WidgetBase*/ widget) {
			//	summary:
			//		Clears the display of errors for a given widget.

			if (widget.errorNode) {
				domConstruct.destroy(widget.errorNode);
				widget.errorNode = null;
			}
		},

		_validate: function (/*framework/model/_Model*/ model) {
			//	summary:
			//		Validates the given model and displays any errors
			//		associated with it next to the respective form fields.

			model.validate();

			var errors = model.getErrors();

			this._getDescendantFormWidgets().forEach(function (widget) {
				if (!widget.name) {
					return;
				}

				var field = widget.name;

				if (!errors[field]) {
					this._clearErrors(widget);
					return;
				}

				var errorNode = domConstruct.create("ul", {
					className: "field-" + field + " errors"
				});

				for (var i = 0, error; (error = errors[field][i]); ++i) {
					domConstruct.create("li", {
						innerHTML: error.toString({ name: this._fieldLabels[field] || field })
					}, errorNode);
				}

				if (widget.errorNode) {
					domConstruct.destroy(widget.errorNode);
				}

				domConstruct.place(errorNode, widget.domNode, "after");
				widget.errorNode = errorNode;
			}, this);

			return model.isValid();
		}
	});
});