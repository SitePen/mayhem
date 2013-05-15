define([
	'dojo/_base/lang',
	'dojo/_base/declare',
	'./BoundNode',
	'./PlaceholderNode',
	'dojo/_base/array',
	'dojo/query',
	'dojo/dom-attr'
], function (lang, declare, BoundNode, PlaceholderNode, array, query, domAttr) {

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
		},

		_bind: function (view) {
			var contentNode = this;
			query('[data-bound-attributes]', this.fragment).forEach(function (element) {
				var dataBoundAttributeMap = JSON.parse(domAttr.get(element, 'data-bound-attributes'));
				for (var attributeName in dataBoundAttributeMap) {
					contentNode._applyBindingExpression(
						dataBoundAttributeMap[attributeName],
						view,
						lang.hitch(domAttr, 'set', element, attributeName)
					);
				}
			});
		}
	});
});