define([
	"dojox/mobile/Heading",
	"../util"
], function (Heading, util) {
	//	summary:
	//		Ensures the moveTo, href, and transition properties are properly
	//		applied to the back button of the Heading if they are changed after
	//		the back button is created.

	var createSetter = util.createSetter;
	Heading.extend({
		_setMoveToAttr: createSetter("moveTo", "backButton"),
		_setHrefAttr: createSetter("href", "backButton"),
		_setTransitionAttr: createSetter("transition", "backButton")
	});
});