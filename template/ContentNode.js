define([
	'dojo/_base/lang',
	'dojo/_base/declare',
	'./BoundNode',
	'./PlaceholderNode',
	'dojo/_base/array',
	'./DataBindingExpression'
], function (lang, declare, BoundNode, PlaceholderNode, arrayUtil, DataBindingExpression) {

	function findPlaceMarker(rootNode, id) {
		// TODO: See if we can use querySelectorAll instead
		return rootNode.querySelectorAll('[data-template-node-id="' + id + '"]')[0];
	}

	return declare(BoundNode, {
		// summary:
		//		Template node for managing HTML content and nested template nodes.

		// dependencyMap: [readonly] Object
		//		A map of dependency MID's to resolved dependencies
		dependencyMap: null,

		// masterFragment: [readonly] DomFragment
		//		A DOM fragment containing content to be cloned for instances
		masterFragment: null,

		// templateNodeConstructors: [readonly] Array
		// 		Constructors for the template nodes owned by this node
		templateNodeConstructors: null,

		// fragment: DomFragment
		//		The DOM fragment associated with this instance
		fragment: null,

		// templateNodes: Array
		//		The template nodes owned by this node
		templateNodes: null,

		_create: function (kwArgs) {
			var view = kwArgs.view,
				contentNode = this,
				contentNodeFragment = this.fragment = this.masterFragment.cloneNode(true);

			this.inherited(arguments);

			// Get our widget-typed elements before instantiating template nodes,
			// which may have their own widget-typed elements.
			var widgetDomNodes = contentNodeFragment.querySelectorAll('[is]');

			// Instantiate template nodes before widgets
			// because Dijits are clobbering the template node placeholders.
			// TODO: This likely means data-bound widget content is broken. Fix this with our own widgets or insist on data binding to widget properties that affect contents.
			this.templateNodes = arrayUtil.map(this.templateNodeConstructors, function (TemplateNodeConstructor) {
				var id = TemplateNodeConstructor.prototype.id,
					placeMarkerDomNode = findPlaceMarker(contentNodeFragment, id),
					templateNode = new TemplateNodeConstructor(kwArgs);

				templateNode.placeAt(placeMarkerDomNode, 'replace');
				return templateNode;
			});

			// Instantiate widgets
			arrayUtil.forEach(widgetDomNodes, function (typedElement) {
				var type = typedElement.getAttribute('is'),
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
				elementsWithBoundAttributes = this.fragment.querySelectorAll('[data-bound-attributes]');

			arrayUtil.forEach(elementsWithBoundAttributes, function (element) {
				var dataBoundAttributeMap = JSON.parse(element.getAttribute('data-bound-attributes'));
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