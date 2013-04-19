define([
	'teststack!bdd',
	'teststack/chai!expect',
	'dojo/_base/declare',
	'../../widget/ContainerMixin',
	'../../widget/Widget',
	'dojo/dom-construct',
	'dojo/dom-attr',
	'dojo/query',
	'dojo/_base/lang',
	'dojo/_base/array'
], function(bdd, expect, declare, ContainerMixin, Widget, domConstruct, domAttr, query, lang, array) {

	bdd.describe('ContainerMixin', function () {

		// Add instrumentation to make sure all test Widgets are destroyed after each test.
		var widgets = [];
		Widget = declare(Widget, {
			_create: function () {
				this.inherited(arguments);
				widgets.push(this);
			}
		});
		bdd.afterEach(function () {
			while (widgets.length > 0) {
				widgets.pop().destroy();
			}
		});

		var TestContainer = declare([ Widget, ContainerMixin ], {
			_create: function (propertiesToMixIn) {
				this.inherited(arguments);

				var domNode = this.domNode,
					insertionPointSpecs = (propertiesToMixIn && propertiesToMixIn.insertionPointSpecs) || [];
				array.forEach(insertionPointSpecs, function (insertionPointSpec) {
					var insertionPointNode = domConstruct.create('div', { 'data-dojo-insertion-point': '' });
					if (insertionPointSpec) {
						domAttr.set(insertionPointNode, 'data-dojo-content-select', insertionPointSpec);
					}
					domNode.appendChild(insertionPointNode);
				});
			}
		});

		bdd.it('should support adding children via addChild()', function () {
			var container = new TestContainer(),
				widget = new Widget({ className: 'child-to-add' });

			container.addChild(widget);

			var matchingNodes = query('.child-to-add', container.domNode);
			expect(matchingNodes.length).to.equal(1);
			expect(matchingNodes[0].widget).to.equal(widget);
		});

		bdd.it('should support removing children via removeChild()', function () {
			var container = new TestContainer(),
				widget = new Widget({ className: 'child-to-remove' });

			container.addChild(widget);
			container.removeChild(widget);

			var matchingNodes = query('.child-to-remove', container.domNode);
			expect(matchingNodes.length).to.equal(0);
		});

		bdd.it('should call destroy() on all its children when it is destroyed', function () {
			var logOfDestruction = {},
				DestroyLoggingWidget = declare(Widget, {
					destroy: function () {
						this.inherited(arguments);
						logOfDestruction[this.id] = true;
					}
				}),
				container = new TestContainer(),
				widgets = [
					new DestroyLoggingWidget(),
					new DestroyLoggingWidget(),
					new DestroyLoggingWidget(),
				];

			array.forEach(widgets, lang.hitch(container, 'addChild'));
			container.destroy();
			array.forEach(widgets, function (widget) {
				expect(logOfDestruction).to.contain.property(widget.id);
			});
		});

		bdd.it('should identify insertion points with a data-dojo-insertion-point attribute', function () {
			var CustomTestContainer = declare([ Widget, ContainerMixin ], {
				_create: function () {
					this.inherited(arguments);

					this.expectedInsertionPointNode = domConstruct.create('div', { 'data-dojo-insertion-point': '' });
					this.domNode.appendChild(this.expectedInsertionPointNode);
				}
			});

			var container = new CustomTestContainer();
			expect(container._insertionPoints).to.contain(container.expectedInsertionPointNode);
		});

		bdd.it('should distribute a new child widget to an insertion points according to selection criteria', function () {
			var container = new TestContainer({
					insertionPointSpecs: [ '.child-goes-here' ]
				}),
				widget = new Widget({ className: 'child-goes-here' });

			container.addChild(widget);
			var insertionPoint = query('[data-dojo-content-select=".child-goes-here"]', container.domNode)[0];
			expect(insertionPoint).to.not.be.undefined;
			expect(insertionPoint.childNodes.length).to.equal(1);
			expect(insertionPoint.childNodes[0].widget).to.equal(widget);
		});

		bdd.it('should distribute child widgets to first matching insertion point', function () {
			var container = new TestContainer({
					insertionPointSpecs: [ '.child-goes-here', '.child-goes-here' ]
				}),
				widget = new Widget({ className: 'child-goes-here' });

			container.addChild(widget);
			var insertionPoints = query('[data-dojo-content-select=".child-goes-here"]', container.domNode);
			expect(insertionPoints.length).to.equal(2);
			expect(insertionPoints[0].childNodes.length).to.equal(1);
			expect(insertionPoints[0].childNodes[0].widget).to.equal(widget);
			expect(insertionPoints[1].childNodes.length).to.equal(0);
		});

		bdd.it('should append an unmatched child widget to the end of the container', function () {
			var container = new TestContainer({
					insertionPointSpecs: [ '.criteria1', '.criteria2' ]
				}),
				widget = new Widget();

			container.addChild(widget);
			expect(container.domNode.lastChild.widget).to.equal(widget);
		});

		bdd.it('should treat an insertion point without selection criteria as matching all child candidates', function () {
			var container = new TestContainer({
					insertionPointSpecs: [ '' ]
				}),
				widget = new Widget({ className: 'arbitrary-class-name' });

			container.addChild(widget);
			var insertionPoint = query('[data-dojo-insertion-point]', container.domNode)[0];
			expect(insertionPoint.childNodes.length).to.equal(1);
			expect(insertionPoint.childNodes[0].widget).to.equal(widget);
		});
	});
});