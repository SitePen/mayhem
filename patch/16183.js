define([
	"dojo/dom-construct",
	"dojo/dom-style",
	"dojo/has",
	"dojox/mobile/View",
	"dojox/mobile/viewRegistry"
], function (domConstruct, domStyle, has, View, viewRegistry) {
	View.extend({
		buildRendering: function () {
			// summary:
			//		Fixes dojox/mobile/View to support templating.

			if(!this.domNode){
				this.domNode = this.containerNode = this.srcNodeRef || domConstruct.create(this.tag);
			}

			this._animEndHandle = this.connect(this.domNode, "webkitAnimationEnd", "onAnimationEnd");
			this._animStartHandle = this.connect(this.domNode, "webkitAnimationStart", "onAnimationStart");
			if(!has("config-mblCSS3Transition")){
				this._transEndHandle = this.connect(this.domNode, "webkitTransitionEnd", "onAnimationEnd");
			}
			if(has("mblAndroid3Workaround")){
				// workaround for the screen flicker issue on Android 3.x/4.0
				// applying "-webkit-transform-style:preserve-3d" to domNode can avoid
				// transition animation flicker
				domStyle.set(this.domNode, "webkitTransformStyle", "preserve-3d");
			}

			viewRegistry.add(this);
			this.inherited(arguments);
		}
	});
});

