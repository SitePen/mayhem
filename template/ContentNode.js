define([
	'dojo/_base/lang',
	'dojo/_base/declare',
	'./BoundNode',
	'./PlaceholderNode',
	'dojo/_base/array',
	'./DataBindingExpression'
], function (lang, declare, BoundNode, PlaceholderNode, arrayUtil, DataBindingExpression) {
	return declare(BoundNode, {
		// summary:
		//		Template node for managing HTML content and nested template nodes.

		// dependencyMap: [readonly] Object
		//		A map of dependency MID's to resolved dependencies
		dependencyMap: null,

		// nodeIdAttributeName: String
		//		The name of the DOM attribute referencing template node IDs.
		nodeIdAttributeName: null,

		// widgetTypeAttributeName: String
		//		The name of the DOM attribute that associates an element with a widget type
		widgetTypeAttributeName: null,

		// boundAttributesAttributeName: String
		//		The name of the DOM attribute that defines an element's data-bound attributes
		boundAttributesAttributeName: null,

		// masterFragment: [readonly] DomFragment
		//		A DOM fragment containing content to be cloned for instances
		masterFragment: null,

		// templateNodeConstructors: [readonly] Array
		// 		Constructors for the template nodes owned by this node
		templateNodeConstructors: null,

		// templateNodes: Array
		//		The template nodes owned by this node
		templateNodes: null,

		_create: function (kwArgs) {
			var view = kwArgs.view,
				contentNode = this,
				contentNodeFragment = this.fragment = this.masterFragment.cloneNode(true);

			function findPlaceMarker(id) {
				return contentNodeFragment.querySelectorAll(
					'[' + contentNode.nodeIdAttributeName + '="' + id + '"]'
				)[0];
			}

			this.inherited(arguments);

			// Get our widget-typed elements before instantiating template nodes,
			// which may have their own widget-typed elements.
			var widgetDomNodes = contentNodeFragment.querySelectorAll('[' + contentNode.widgetTypeAttributeName + ']');

			// Instantiate template nodes before widgets
			// because Dijits are clobbering the template node placeholders.
			// TODO: This likely means data-bound widget content is broken. Fix this with our own widgets or insist on data binding to widget properties that affect contents.
			this.templateNodes = arrayUtil.map(this.templateNodeConstructors, function (TemplateNodeConstructor) {
				var id = TemplateNodeConstructor.prototype.id,
					placeMarkerDomNode = findPlaceMarker(id),
					templateNode = new TemplateNodeConstructor(kwArgs);

				templateNode.placeAt(placeMarkerDomNode, 'replace');
				return templateNode;
			});

			// Instantiate widgets
			arrayUtil.forEach(widgetDomNodes, function (typedElement) {
				var type = typedElement.getAttribute(contentNode.widgetTypeAttributeName),
					WidgetConstructor = contentNode.dependencyMap[type];

				var widget = new WidgetConstructor(null, typedElement);

				// TODO: Consider whether these would be better implemented by Widget base class. Probably: yes.
					// TODO: Support property spec attribute like data-dojo-props
					// TODO: Support event listener spec attribute like data-dojo-attach-events
					// TODO: Support action attribute to bind widget events to view actions.
					// TODO: Support attach points through data-dojo-attach-point.

				// Associate widget with view model
				widget.set('viewModel', view.viewModel);
				var fieldName = typedElement.getAttribute('data-field');
				if (fieldName) {
					widget.set('fieldName', fieldName);
				}
			});
		},

		_bind: function (kwArgs) {
			// DOM Attribute data binding
			var bindingContext = kwArgs.bindingContext,
				boundAttributesAttributeName = this.boundAttributesAttributeName;
				elementsWithBoundAttributes = this.fragment.querySelectorAll('[' + boundAttributesAttributeName + ']');

			arrayUtil.forEach(elementsWithBoundAttributes, function (element) {
				var dataBoundAttributeMap = JSON.parse(element.getAttribute(boundAttributesAttributeName));
				
				// Remove attribute so the element doesn't appear in ancestors' data binding queries.
				element.setAttribute(boundAttributesAttributeName, null);

				for (var attributeName in dataBoundAttributeMap) {
					var expression = new DataBindingExpression(dataBoundAttributeMap[attributeName]);
					expression.bind(bindingContext, lang.hitch(element, 'setAttribute', attributeName));
				}
			});
		},

		startup: function () {
			this.inherited(arguments);

			// Startup template nodes
			arrayUtil.forEach(this.templateNodes, function (templateNode) {
				templateNode.startup();
			});

			// TODO: Startup widgets.
		},

		destroy: function () {
			// Destroy template nodes
			arrayUtil.forEach(this.templateNodes, function (templateNode) {
				// TODO: Consider how to avoid removing child nodes from DOM piecemeal. Better to remove once from DOM at destruction root.
				// TODO: Reenable this once the problem of widgets eating template nodes is solved. Right now, destroy() ends up doing illegal things with DOM ranges because of that.
				//templateNode.destroy();
			});

			// TODO: Destroy widgets.

			this.inherited(arguments);
		}
	});
});