define([
	'dojo/_base/lang',
	'dojo/_base/declare',
	'./BoundNode',
	'./PlaceholderNode',
	'dojo/_base/array',
	'dojo/query',
	'dojo/dom-attr',
	'./DataBindingExpression'
], function (lang, declare, BoundNode, PlaceholderNode, arrayUtil, query, domAttr, DataBindingExpression) {

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
			var contentNode = this,
				contentNodeFragment = this.fragment = this.masterFragment.cloneNode(true);

			this.inherited(arguments);

			// Get our widget-typed elements before instantiating template nodes,
			// which may have their own widget-typed elements.
			var widgetDomNodes = query('[is]', contentNodeFragment);

			// Instantiating template nodes before widgets because Dijits
			// are clobbering our template node placeholders.
			// TODO: This likely means data-bound widget content is broken. Fix this with our own widgets or insist on data binding to widget properties that affect contents.
			this.templateNodes = arrayUtil.map(this.templateNodeConstructors, function (TemplateNodeConstructor) {
				var id = TemplateNodeConstructor.prototype.id,
					placeMarkerDomNode = findPlaceMarker(contentNodeFragment, id),
					templateNode = new TemplateNodeConstructor(view, options);

				templateNode.placeAt(placeMarkerDomNode, 'replace');
			});

			// Instantiate widgets
			widgetDomNodes.forEach(function (typedElement) {
				var type = domAttr.get(typedElement, 'is'),
					WidgetConstructor = contentNode.dependencyMap[type];

				var widget = new WidgetConstructor(null, typedElement);

				// TODO: Consider whether these would be better implemented by Widget base class. Probably: yes.
					// TODO: Support property spec attribute like data-dojo-props
					// TODO: Support event listener spec attribute like data-dojo-attach-events
					// TODO: Support action attribute to bind widget events to view actions.
					// TODO: Support attach points through data-dojo-attach-point.

				// Associate widget with view model
				widget.set('viewModel', view.viewModel);
				var fieldName = domAttr.get(typedElement, 'data-field');
				if (fieldName) {
					widget.set('fieldName', fieldName);
				}
			});
		},

		_bind: function (view, options, context) {
			query('[data-bound-attributes]', this.fragment).forEach(function (element) {
				var dataBoundAttributeMap = JSON.parse(domAttr.get(element, 'data-bound-attributes'));
				for (var attributeName in dataBoundAttributeMap) {
					var expression = new DataBindingExpression(dataBoundAttributeMap[attributeName]);
					expression.bind(context, lang.hitch(domAttr, 'set', element, attributeName));
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
			this.inherited(arguments);

			// Destroy template nodes
			arrayUtil.forEach(this.templateNodes, function (templateNode) {
				// TODO: Consider how to avoid removing child nodes from DOM piecemeal. Better to remove once from DOM at destruction root.
			});

			// TODO: Destroy widgets.
		}
	});
});