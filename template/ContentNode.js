define([
	'dojo/has',
	'dojo/_base/lang',
	'dojo/_base/declare',
	'./BoundNode',
	'./PlaceholderNode',
	'dojo/_base/array',
	'./DataBindingExpression'
], function (has, lang, declare, BoundNode, PlaceholderNode, arrayUtil, DataBindingExpression) {
	return declare(BoundNode, {
		// summary:
		//		Template node for managing HTML content and nested template nodes.

		// nodeIdAttributeName: String
		//		The name of the DOM attribute referencing template node IDs.
		nodeIdAttributeName: null,

		// boundElementAttributeName: String
		//		The name of the DOM attribute that identifies a data-bound element.
		boundElementAttributeName: null,

		// masterFragment: [readonly] DomFragment
		//		A DOM fragment containing content to be cloned for instances
		masterFragment: null,

		// boundElementMap: Object
		//		A hash of data-bound element IDs to a hash of attribute names to expression ASTs.
		boundElementMap: null,

		// templateNodeConstructors: [readonly] Array
		// 		Constructors for the template nodes owned by this node
		templateNodeConstructors: null,

		// templateNodes: Array
		//		The template nodes owned by this node
		templateNodes: null,

		_create: function (kwArgs) {
			var contentNode = this,
				contentNodeFragment = this.fragment = this.masterFragment.cloneNode(true);

			this.inherited(arguments);
			this._bindDomAttributes(kwArgs);

			function findPlaceMarker(id) {
				return contentNodeFragment.querySelectorAll(
					'[' + contentNode.nodeIdAttributeName + '="' + id + '"]'
				)[0];
			}

			this.templateNodes = arrayUtil.map(this.templateNodeConstructors, function (TemplateNodeConstructor) {
				var id = TemplateNodeConstructor.prototype.id,
					placeMarkerDomNode = findPlaceMarker(id),
					templateNode = new TemplateNodeConstructor(kwArgs);

				templateNode.placeAt(placeMarkerDomNode, 'replace');
				return templateNode;
			});
		},

		_bindDomAttributes: function (kwArgs) {
			// DOM Attribute data binding
			var bindingContext = kwArgs.bindingContext,
				boundElementAttributeName = this.boundElementAttributeName,
				elementsWithBoundAttributes = this.fragment.querySelectorAll('[' + boundElementAttributeName + ']'),
				boundElementMap = this.boundElementMap;

			arrayUtil.forEach(elementsWithBoundAttributes, function (element) {
				var boundElementId = element.getAttribute(boundElementAttributeName),
					boundAttributeMap = boundElementMap[boundElementId];

				// Remove attribute so the element doesn't appear in ancestors' data binding queries.
				element.removeAttribute(boundElementAttributeName);

				if (boundAttributeMap) {
					for (var attributeName in boundAttributeMap) {
						var expression = new DataBindingExpression(boundAttributeMap[attributeName]);
						expression.bind(bindingContext, lang.hitch(element, 'setAttribute', attributeName));
					}
				}
				else if (has('debug')) {
					console.warn('Unable to find attribute name for data-bound element ' + boundElementId);
				}
			});
		},

		startup: function () {
			this.inherited(arguments);

			// Startup template nodes
			arrayUtil.forEach(this.templateNodes, function (templateNode) {
				templateNode.startup();
			});
		},

		destroy: function () {
			// Destroy template nodes
			arrayUtil.forEach(this.templateNodes, function (templateNode) {
				// TODO: Consider how to avoid removing child nodes from DOM piecemeal. Better to remove once from DOM at destruction root.
				templateNode.destroy();
			});

			this.inherited(arguments);
		}
	});
});