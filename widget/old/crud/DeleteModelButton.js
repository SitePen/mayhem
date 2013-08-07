define([
	"dojo/_base/declare",
	"dojo/_base/lang",
	"dojo/dom-class",
	"dojo/when",
	"dojo/i18n!../../nls/common",
	"../../has",
	"dojo/has!tablet?dojox/mobile/ToolBarButton:dojox/mobile/Button",
	"dojox/mobile/Button",
	"dojox/mobile/Opener",
	"dijit/_Container"
], function (declare, lang, domClass, when, i18n, has, BaseButton, Button, Opener, _Container) {
	// Opener contains content so there is no reason for it not to include _Container
	Opener = declare([ Opener, _Container ]);

	return declare(BaseButton, {
		i18n: i18n,

		//	model: framework/model/_Model?
		//		Model to delete when the delete action is confirmed.
		model: null,

		//	popup: dojox/mobile/Opener
		//		The pop-up displayed when the delete button is tapped.
		popup: null,

		//	deleteActionLabel: string
		//		The label to use for the delete confirmation button inside the
		//		pop-up.
		deleteActionLabel: i18n.deleteAction,

		//	_popupDeleteButton: [private] dojox/mobile/Button
		//		The delete button inside the opener.
		_popupDeleteButton: null,

		postMixInProperties: function () {
			this.inherited(arguments);

			if (!this.label) {
				this.set("label", this.i18n.deleteAction);
			}
		},

		buildRendering: function () {
			//	summary:
			//		Generates the pop-up for the delete button.

			this.inherited(arguments);

			domClass.add(this.domNode, "deleteButton");

			this.popup = new Opener();
			this.popup.addChild(this._popupDeleteButton = new Button({
				label: this.deleteActionLabel,
				onClick: lang.hitch(this, "_deleteModel")
			}));

			domClass.add(this.popup.domNode, "deleteButtonOpener");
			domClass.add(this._popupDeleteButton.domNode, "destructive");

			if (!has("tablet")) {
				this.popup.addChild(new Button({
					label: this.i18n.cancel,
					onClick: lang.hitch(this.popup, "hide")
				}));
			}
		},

		startup: function () {
			//	summary:
			//		Ensures the associated pop-up is in the DOM and started when the
			//		delete button is started.

			this.inherited(arguments);
			this.popup.placeAt(document.body);
			this.popup.startup();
		},

		_setDeleteActionLabelAttr: function (value) {
			//	summary:
			//		Sets the label for the delete confirmation button inside the pop-up.

			this._popupDeleteButton && this._popupDeleteButton.set("label", value);
			this._set("deleteActionLabel", value);
		},

		_deleteModel: function () {
			//	summary:
			//		Deletes the model and hides the pop-up. Emits a "delete" event
			//		after the model is successfully deleted.

			if (this.model) {
				var self = this;
				when(this.model.store.remove(this.model.id)).then(function () {
					self.emit("delete", { model: self.model });
					self.set("model", null);
				});
			}

			this.popup.hide();
		},

		onClick: function (event) {
			//	summary:
			//		Shows pop-up in response to a tap.

			event.preventDefault();
			this.inherited(arguments);
			this.popup.show(this.domNode, [ "below-centered", "above-centered" ]);
		},

		_setModelAttr: function (value) {
			this.set("disabled", !value);
			this._set("model", value);
		}
	});
});
