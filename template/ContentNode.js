define([
	'dojo/_base/declare',
	'./BoundNode',
	'./PlaceholderNode',
	'dojo/_base/array',
	'dojo/query'
], function (declare, BoundNode, PlaceholderNode, array, query) {

	function findPlaceMarker(rootNode, id) {
		return query('[data-template-node-id="' + id + '"]', rootNode)[0];
	}

	return declare(BoundNode, {
		masterFragment: null,
		fragment: null,
		dependencyMap: null,
		templateNodeConstructors: null,
		templateNodes: null,

		_create: function (view, options) {
			var contentNodeFragment = this.fragment = this.masterFragment.cloneNode(true),
				placeholderMap = options.root.placeholderMap;
			this.inherited(arguments);

			this.templateNodes = array.map(this.templateNodeConstructors, function (TemplateNodeConstructor) {
				var id = TemplateNodeConstructor.prototype.id,
					placeMarkerDomNode = findPlaceMarker(contentNodeFragment, id),
					templateNode = new TemplateNodeConstructor(view);

				if (templateNode.isInstanceOf(PlaceholderNode)) {
					placeholderMap[templateNode.name] = templateNode;
				}

				templateNode.placeAt(placeMarkerDomNode, 'replace');
			});
		}
	});
});