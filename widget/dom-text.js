define([ 'dojo/domReady!' ], function () {
	var textProperty = ('textContent' in document.body) ? 'textContent' : 'innerText';

	return {
		get: function (domNode) {
			return domNode[textProperty];
		},
		set: function (domNode, text) {
			domNode[textProperty] = text;
		}
	};
});