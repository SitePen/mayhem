define([
	"dojo/_base/declare",
	"dojo/_base/lang",
	"dojo/dom-class",
	"dojo/touch",
	"dojo/has!tablet?dojox/mobile/FixedSplitter:dijit/_WidgetBase",
	"dojo/has!tablet?dijit/layout/_LayoutWidget:",
	"dojox/mobile/ContentPane",
	"dojox/mobile/Heading",
	"dojox/mobile/ToolBarButton",
	"../../has",
	"./_CrudController"
], function (declare, lang, domClass, touch, _WidgetBase, _LayoutWidget, ContentPane, Heading, ToolBarButton, has, _CrudController) {

	var baseClass = [ _WidgetBase, _CrudController ];
	_LayoutWidget && baseClass.push(_LayoutWidget);

	return declare(baseClass, {
		//	summary:
		//		A container layout widget for CRUD interfaces that implements
		//		additional layout features for tablets.

		//	orientation: string
		//		See dojox/mobile/FixedSplitter. Applies only to tablet interface.
		orientation: "H",

		//	openerButtonLabel: string
		//		Label to use on the button that opens the master pane when in portrait
		//		view on tablet. Applies only to tablet interface.
		openerButtonLabel: "",

		buildRendering: function () {
			this.inherited(arguments);

			if (has("tablet")) {
				var self = this;
				this.detail.getChildren().some(function (heading) {
					var openerButton = new ToolBarButton({ label: self.openerButtonLabel });
					domClass.add(openerButton.domNode, "openerButton");
					openerButton.on("click", lang.hitch(self, "openMasterPane"));

					if(heading instanceof Heading){
						heading.set("back", "");
						heading.addChild(openerButton, "first");
						return true;
					}
					return false;
				});

				this.edit.getChildren().some(function (heading) {
					var openerButton = new ToolBarButton({ label: self.openerButtonLabel });
					domClass.add(openerButton.domNode, "openerButton");
					openerButton.on("click", lang.hitch(self, "openMasterPane"));

					if (heading instanceof Heading) {
						heading.addChild(openerButton, "first");
						return true;
					}
					return false;
				});

				this.browse.on("dgrid-select", function () {
					self.closeMasterPane();
				});
			}
		},

		_placeChildren: function () {
			if (has("tablet")) {
				this.masterPane = new ContentPane();
				this.masterPane.addChild(this.browse);

				this.detailPane = new ContentPane();
				this.detailPane.addChild(this.detail);
				this.detailPane.addChild(this.edit);

				this.addChild(this.masterPane);
				this.addChild(this.detailPane);

				this.detailPane.on(touch.release, lang.hitch(this, "closeMasterPane"));

				domClass.add(this.domNode, "splitView");
				domClass.add(this.masterPane.domNode, "splitViewPane splitViewMasterPane");
				domClass.add(this.detailPane.domNode, "splitViewPane splitViewDetailPane");
			}
			else {
				this.inherited(arguments);
			}
		},

		layout: has("tablet") ? function () {
			var self = this;
			setTimeout(function () {
				var isPortrait = domClass.contains(document.documentElement, "dj_portrait");
				domClass.toggle(self.domNode, "open", !isPortrait);

				self.detailPane.domNode.style.left = isPortrait ? 0 : "";
				self.detailPane.domNode.style.width = isPortrait ? "100%" : "";
			}, has("android") ? 200 : 0);
		} : null,

        openMasterPane: function () {
            //  summary:
            //      Opens the master pane if closed.

            domClass.add(this.domNode, "open");
        },

        closeMasterPane: function () {
            //  summary:
            //      Closes the master pane if it is open.

			if (domClass.contains(document.documentElement, "dj_portrait")) {
				domClass.remove(this.domNode, "open");
			}
        }
	});
});