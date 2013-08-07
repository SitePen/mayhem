define([
	"dojo/_base/declare",
	"dojo/router",
	"dojo/when",
	"dijit/_Container",
	"../../has"
], function (declare, router, when, _Container, has) {
	return declare(_Container, {
		//	summary:
		//		A controller mixin for CRUD views.

		//	browseClass: Function
		//		Constructor for the browse view.
		browseClass: null,

		//	detailClass: Function
		//		Constructor for the detail view.
		detailClass: null,

		//	editClass: Function
		//		Constructor for the edit view.
		editClass: null,

		//	currentView: dojox/mobile/View
		//		The currently active view.
		currentView: null,

		//	store: dojo/store/api/Store
		//		The store to interact with.
		store: null,

		//	model: framework/model/_Model?
		//		The currently active modelled data object.
		model: null,

		buildRendering: function () {
			this.inherited(arguments);

			this.browse = new this.browseClass({
				id: this.id + "_browse",
				newHref: "#/" + this.id + "/new",
				controller: this
			});

			this.detail = new this.detailClass({
				id: this.id + "_detail",
				backHref: "#/" + this.id + "/browse",
				controller: this
			});

			this.edit = new this.editClass({
				id: this.id + "_edit",
				controller: this
			});

			this.currentView = has("tablet") ? this.detail : this.browse;

			this._placeChildren();
		},

		_placeChildren: function () {
			//	summary:
			//		Places the individual views into the controller container.
			//		May be overridden to place interfaces in different orders
			//		or into different containers.

			this.addChild(this.browse);
			this.addChild(this.detail);
			this.addChild(this.edit);
		},

		postCreate: function () {
			this.inherited(arguments);

			var self = this;
			this.browse.on("dgrid-select", function (event) {
				var model = event.rows[0].data;
				self.detail.set("model", model);
				self.edit.set("model", model);
				self.go("detail/" + model.id);
			});
		},

		go: function (path, replace) {
			//	summary:
			//		Navigate to another subview within this controller.

			if (path.charAt(0) !== "#") {
				path = "#/" + this.id + "/" + path;
			}

			return router.go(path, replace);
		},

		transitionTo: function (/*dojox/mobile/View*/ view, /*Object?*/ options) {
			//	summary:
			//		Transition from the current view to another view within
			//		this controller.
			//	view:
			//		The view to transition to.
			//	options:
			//		An object of the type passed as the first argument to
			//		`dojox/mobile/View.prototype.performTransition`.

			if (view === this.currentView) {
				return;
			}

			options = options || {};
			options.moveTo = view.id;
			options.transition = options.transition || "slide";
			options.transitionDir = this.currentView.domNode.compareDocumentPosition(view.domNode) === /*DOCUMENT_POSITION_PRECEDING*/ 2 ? -1 : 1;

			this.currentView.performTransition(options);
			this.currentView = view;
		},

		route: function (/*Object*/ params, /*Object?*/ options) {
			//	summary:
			//		Routes subview requests within the controller.
			//	params:
			//		A parameters object from the current route.
			//	options:
			//		An optional options object with guidance about how to route
			//		the current subview request. One or more of the following:
			//		* immediateTransition (boolean?): If true, the transition
			//			should occur with no animation.

			if (!params.rest) {
				this.go("browse", true);
				return;
			}

			var self = this,
				match;

			if (params.rest === "browse") {
				if (has("tablet")) {
					when(this.store.query({}, { limit: 1 })).then(function (results) {
						self.set("model", results[0]);
						self.go("detail/" + results[0].id, true);
					});
					this.transitionTo(this.detail);
				}
				else {
					this.transitionTo(this.browse);
				}
			}
			else if (params.rest === "new") {
				this.set("model", this.store.createModel());
				this.transitionTo(this.edit);
			}
			else if ((match = /^(detail|edit)\/([^\/]+)/.exec(params.rest))) {
				var viewId = match[1],
					modelId = match[2];

				// store models might be numbers but the regular expression will always
				// return strings, so explicitly coerce the model id to a string
				if (!this.model || ("" + this.model.id) !== modelId) {
					when(this.store.get(modelId)).then(function (model) {
						self.set("model", model);
						self.transitionTo(self[viewId], {
							transition: self._getTransitionType(options)
						});
					});
				}
				else {
					this.transitionTo(this[viewId], {
						transition: this._getTransitionType(options)
					});
				}
			}
		},

		_getTransitionType: function (/*Object*/ options) {
			//	summary:
			//		Calculates the correct animation for the current transition
			//		state.

			return options.immediateTransition ? "none" :
				(this.currentView === this.detail || this.currentView === this.edit) ? "fade" :
				"";
		},

		_setStoreAttr: function (value) {
			this._set("store", value);
			this.browse.set("store", value);
		},

		_setModelAttr: function (value) {
			this._set("model", value);
			this.detail.set("model", value);
			this.edit.set("model", value);
		}
	});
});
