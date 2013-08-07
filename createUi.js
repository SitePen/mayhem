define([
	"require",
	"dojo/hash",
	"dojo/router",
	"dojo/on",
	"dojo/promise/all",
	"./widget/FlexibleView",
	"./widget/LazyContainerView",
	"dojox/mobile/Heading",
	"dojox/mobile/RoundRectList",
	"dojox/mobile/ListItem"
], function(require, hash, router, on, whenAll, FlexibleView, LazyContainerView, Heading, RoundRectList, ListItem){
	return function(/*Object*/ config, /*DomNode*/ containerNode){
		//	summary:
		//		Create the UI from the view modules specified in the config parameter.
		//	config:
		//		A configuration object with the following properties:
		//		* title: string?
		//			If present, this value will be displayed in a Heading at the top of the home
		//			view.
		//		* createMenu: boolean?
		//			If true, a home view will be created with an auto-generated menu.
		//		* defaultViewId: string?
		//			If specified, the view that should be displayed when the application first
		//			loads.
		//		* views: Object[]
		//			An array of objects defining the top-level views in the application.
		//			View object properties:
		//			* title: string?
		//				The title of the view - this is displayed in the auto-generated index page.
		//			* id: string
		//				The id to assign the dojox/mobile/View that will contain the view widget.
		//				(Also used as the hash value in the URL when the view is active.) The id
		//				"home" is reserved.
		//			* moduleId: string
		//				The AMD module ID of the content to be placed in the view.
		//			* kwArgs: Object?
		//				A keyword argument object to pass to the module's constructor.
		//			* loadImmediately: boolean?
		//				If true, the view module will be loaded immediately.
		//				Otherwise, it will only be loaded once the user actually tries to view
		//				it.

		function initUi() {
			//	summary:
			//		Starts up the user interface and begins routing requests.

			function route(/*Event*/ event) {
				//	summary:
				//		Routes a request from dojo/router.
				//	event:
				//		Router event.

				var immediateTransition = false,
					newViewId = event.params.viewId;

				if (newViewId !== currentView.viewId) {
					if (!(newViewId in views)) {
						event.preventDefault();
						return;
					}

					currentView.performTransition({
						moveTo: newViewId + "Container",
						transition: "slide",
						transitionDir: newViewId === "home" ? -1 : 1
					});

					currentView = views[newViewId];

					// If possible, we want the view being transitioned to to display the
					// correct sub-view immediately instead of performing a normal transition
					// since we are already doing one transition
					immediateTransition = true;
				}

				if (newViewId !== "home") {
					currentView.loadContent().then(function (content) {
						if (!content.route) {
							console.warn("Content for view " + newViewId + " does no routing");
						}

						content.route && content.route(event.params, {
							immediateTransition: immediateTransition
						});
					});
				}
			}

			var currentView,
				defaultViewId = config.defaultViewId || "home";

			if (!hash()) {
				hash("/" + defaultViewId, true);
			}

			for (var viewId in views) {
				if (viewId === defaultViewId) {
					currentView = views[viewId];
					views[viewId].set("selected", true);
				}
				views[viewId].startup();
			}

			router.register("/:viewId", route);
			router.register("/:viewId/*rest", route);
			router.startup();
		}

		var views = {},
			readyPromises = [],
			mainMenu;

		if (config.createMenu) {
			views.home = new FlexibleView({ id: "homeContainer", viewId: "home" });
			if (config.title) {
				views.home.addChild(new Heading({ label: config.title }));
			}
			mainMenu = new RoundRectList();
			views.home.addChild(mainMenu);
			views.home.placeAt(containerNode);
		}

		config.views.forEach(function (viewConfig) {
			var view = views[viewConfig.id] = new LazyContainerView({
				id: viewConfig.id + "Container",
				viewId: viewConfig.id,
				moduleId: viewConfig.moduleId,
				moduleArgs: viewConfig.kwArgs
			});

			if (mainMenu) {
				mainMenu.addChild(new ListItem({
					label: viewConfig.title,
					href: "#/" + viewConfig.id
				}));
			}

			view.placeAt(containerNode);

			if(viewConfig.loadImmediately){
				readyPromises.push(view.loadContent());
			}
		});

		return whenAll(readyPromises).then(initUi);
	};
});
