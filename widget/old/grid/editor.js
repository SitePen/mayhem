define([
	"dojo/_base/lang",
	"dojo/aspect",
	"dojo/on",
	"dgrid/editor"
], function (lang, aspect, on, editor) {
	return function (column) {
		//	summary:
		//		An extension of the default column editor that allows editor
		//		controls to be interacted with without triggering selection on
		//		mobile devices.

		var returnValue = editor.apply(this, arguments);

		aspect.after(column, "renderCell", function () {
			var cell = arguments[2],
				input = cell.widget || cell.input;

			on(input, "touchstart", function (event) {
				event.stopPropagation();
			});
		}, true);

		return returnValue;
	};
});
