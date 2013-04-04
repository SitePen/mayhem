define([], function () {

	function IdRender(astNode) {
		this.path = astNode.path;
	}

	IdRender.prototype = {
		constructor: IdRender,

		render: function () {
			return this.path;
		},

		unrender: function () {

		},

		destroy: function () {

		}
	};

	return IdRender;
});