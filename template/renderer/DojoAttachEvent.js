define([
	'dojo/_base/lang',
	'dojo/on'
], function (lang, on) {

	function DojoAttachEventRender(astNode) {
		//	summary:
		//		Manages the rendering of an attach event
		//	astNode:
		//		The AST Node that describes this attach event

		this.events = astNode.events;
	}

	DojoAttachEventRender.prototype = {
		constructor: DojoAttachEventRender,

		render: function (view, context, template, obj) {
			//	summary:
			//		Adds an attach event listener based on the view
			//	view: framework/View
			//		The view being rendered
			//	context:
			//		The context used to resolve logic
			//	template: framework/Template
			//	obj:
			//		The object to add the event listener to.

			var events = this.events,
				i = 0,
				event;

			while ((event = events[i++])) {
				// TODO: proper management of this handle
				on(obj, event[0], lang.hitch(view, event[1]));
			}
		},

		unrender: function () {
			// ...
		},

		destroy: function () {
			// ...
		}
	};

	return DojoAttachEventRender;
});