define([
	'dojo/_base/declare',
	'./BoundNode',
	'dojo/_base/array',
	'dojo/query'
], function (declare, array, query, BoundNode) {

	function findPlaceMarker(root, id) {
		return query('[data-template-control-id="' + id + '"]', this.fragment)[0];
	}

	return declare(BoundNode, {
		fragment: null,
		dependencyMap: null,
		templateNodeConstructors: null,
		templateNodes: null,

		_create: function (view) {
			this.inherited(arguments);

			this.templateNodes = array.map(this.templateNodeConstructors, function (TemplateNodeConstructor) {
				var id = TemplateNodeConstructor.prototype.id,
					placeMarkerDomNode = findPlaceMarker(this.fragment, id),
					templateNode = new TemplateNodeConstructor(view);
				templateNode.placeAt(placeMarkerDomNode, 'replace');
			});
		}
	});
});