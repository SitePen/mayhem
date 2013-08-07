define([
	"dojo/_base/lang",
	"dojo/_base/declare",
	"dojo/dom-class",
	"dojo/Deferred",
	"dojo/on",
	"dojox/mobile/View",
	"dijit/Viewport"
], function (lang, declare, domClass, Deferred, on, View, viewport) {
	(function () {
		//	summary:
		//		When hiding the address bar on iOS, setting an element to height: 100%
		//		will only set it to 100% height of the area of the page, excluding the
		//		address bar, which means that the main containers are too short and
		//		cut off the bottom of the interface. In order to work around this issue,
		//		we have to set at the correct height value of the container elements at
		//		startup and every time the page is resized.

		var extraSheet = document.createElement("style");
		document.getElementsByTagName("head")[0].appendChild(extraSheet);
		extraSheet.sheet.insertRule(".LazyContainerView { height: " + window.innerHeight + "px; }", 0);
		var rule = extraSheet.sheet.cssRules[0].style;

		viewport.on("resize", function () {
			// window.innerHeight on at least iOS 6 has not been updated at the time
			// the resize event fires
			setTimeout(function(){
				rule.setProperty("height", window.innerHeight + "px");
			}, 0);
		});
	}());

	return declare(View, {
		//	summary:
		//		A master view that contains lazy-loaded content. Used by
		//		`framework/createUi`.

		baseClass: "LazyContainerView",

		//	viewId: string
		//		The view ID used to identify this module in the menu
		//		configuration and page URL.
		viewId: null,

		//	moduleId: string
		//		The module ID of the content module to load.
		moduleId: null,

		//	moduleArgs: Object?
		//		Keywords arguments to pass to the content module when it is
		//		instantiated.
		moduleArgs: null,

		postCreate: function () {
			this.own(on.once(this, "beforeTransitionIn", lang.hitch(this, "loadContent")));
			this.own(this.on("beforeTransitionIn", lang.hitch(this, "layoutContent")));
		},

		loadContent: function () {
			//	summary:
			//		Loads and instantiates the content module for this view.
			//	returns: dojo/promise/Promise|undefined

			if (!this.moduleId) {
				throw new Error("Cannot load content without a module ID");
			}

			var dfd = new Deferred(),
				self = this;

			// The router will call it every time this view is routed to but we
			// only load the content once
			this.loadContent = function () {
				return dfd.promise;
			};

			domClass.add(this.domNode, "loading");
			require([ this.moduleId ], function (Content) {
				domClass.remove(self.domNode, "loading");
				dfd.resolve(self._initContent(Content));
			});

			return dfd.promise;
		},

		_initContent: function (/*Function*/ Content) {
			//	summary:
			//		Instantiates the content module for this view.
			//	Content:
			//		A widget constructor that creates a `dijit/_WidgetBase`
			//		widget.
			//	returns: dijit/_WidgetBase
			//		A widget instance.

			var kwArgs = this.moduleArgs || {};
			kwArgs.id = this.viewId;

			var content = new Content(kwArgs);
			this.set("content", content);

			return content;
		},

		_setContentAttr: function (value) {
			if (this.content) {
				this.content.destroyRecursive();
			}

			this.addChild(value);
			this._set("content", value);
		},

		layoutContent: function () {
			//	summary:
			//		Ensure _LayoutWidget content that needs to be resized but was
			//		hidden during an orientation change is resized properly when
			//		the container content is displayed.

			viewport.emit("resize");
		}
	});
});
