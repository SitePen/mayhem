define([], function () {

	function ContentRender(astNode) {
		this.content = astNode.content;
	}

	ContentRender.prototype = {
		constructor: ContentRender,

		render: function () {
			return this.content;
		},

		unrender: function () {

		},

		destroy: function () {

		}
	};

	return ContentRender;
});