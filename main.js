define([
	"require",
	"dojo/on",
	"./has",
	"./patch!"
], function (require, on, has) {
	return {
		startup: function (/*Object*/ config) {
			//	summary:
			//		Starts up the application.
			//	config:
			//		An interface configuration object. See `framework/createUi`
			//		for more information.

			// Startup may only be called once per application
			this.startup = function () {};

			// createUi MUST NOT be loaded until framework/patch has loaded. If you
			// do, the patches will not be applied properly and the framework will
			// be broken.
			require([ "dojox/mobile/common", "./createUi" ], function (dojoxMobile, createUi) {
				// We handle these ourselves because the dojox/mobile code is super hacky
				dojoxMobile.disableResizeAll = true;
				dojoxMobile.disableHideAddressBar = true;

				var fixScrollTimeout;
				function resetScroll() {
					fixScrollTimeout && clearTimeout(fixScrollTimeout);
					fixScrollTimeout = setTimeout(function () {
						window.scrollTo(0, 0);
						dojoxMobile.updateOrient();
						fixScrollTimeout = null;
					}, 0);
				}

				if (!has("tablet")) {
					// Reset scroll when someone touches the page after displaying the address bar
					// so the app is always fully visible when interacted with on iPhone
					window.addEventListener("touchstart", resetScroll, true);

					// Reset scroll when someone focuses a form element, which causes at least
					// iOS 6 on iPhone to scroll the body if the field is near the top of the
					// page
					window.addEventListener("focus", resetScroll, true);

					// Ensure address bar can always be hidden
					var minH = screen.availHeight;
					if (has("android")) {
						minH = window.outerHeight / window.devicePixelRatio;
						if (minH <= window.innerHeight) {
							minH = window.outerHeight;
						}
					}
					document.body.style.minHeight = minH + "px";
					resetScroll();
				}

				// Reset scroll when the window is resized to prevent the content from being
				// scrolled incorrectly; this also updates the platform orientation CSS classes
				window.addEventListener("resize", resetScroll, false);

				// Prevent users dragging around the body, since we fill it with the app
				// view and this should not scroll
				on(window, "touchmove", function (event) {
					event.preventDefault();
				});

				createUi(config, document.body).then(function () {
					document.body.className += " loaded";
				});
			});
		}
	};
});