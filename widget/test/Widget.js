define([
	'teststack!bdd',
	'teststack/chai!expect',
	'../Widget',
	'dojo/dom-construct',
	'dojo/dom-class',
	'dojo/_base/declare'
], function (bdd, expect, Widget, domConstruct, domClass, declare) {

	bdd.describe('Widget', function () {

		var parentNode,
			widget;

		bdd.beforeEach(function () {
			parentNode = domConstruct.create('div', null, document.body);
		});

		bdd.afterEach(function () {
			if (widget) {
				widget.destroy();
				widget = null;
			}
			domConstruct.destroy(parentNode);
			parentNode = null;
		});

		bdd.it('should create a domNode if none exists', function () {
			widget = new Widget();
			expect(widget.domNode).not.to.be.null;
		});

		bdd.it('should not create a domNode if one already exists', function () {
			var expectedDomNode,
				CustomWidget = declare(Widget, {
					_create: function () {
						this.domNode = expectedDomNode = domConstruct.create('span');
						this.inherited(arguments);
					}
				});

			widget = new CustomWidget();
			expect(widget.domNode).to.equal(expectedDomNode);
		});

		bdd.it('should add a .widget property to domNode during creation', function () {
			widget = new Widget();
			expect(widget.domNode.widget).to.equal(widget);
		});

		bdd.it('should remove the .widget property from domNode when the widget is destroyed', function () {
			widget = new Widget();
			widget.destroy();
			expect(widget.domNode).to.not.have.property('widget');
		});

		bdd.it('should replace srcNodeRef if one is provided', function () {
			var nodeToReplace = domConstruct.create('div', null, parentNode);

			// Verify that there is only one child and it is the node to replace.
			expect(parentNode.childNodes.length).to.equal(1);
			expect(parentNode.firstChild).to.equal(nodeToReplace);

			widget = new Widget(null, nodeToReplace);
			widget.startup();

			// Verify that there is still only one child and that the child is now the widget's DOM node.
			expect(parentNode.childNodes.length).to.equal(1);
			expect(parentNode.firstChild).to.equal(widget.domNode);
		});

		bdd.it('should remove domNode from the DOM when the widget is destroyed', function () {
			widget = new Widget(null);

			expect(parentNode.childNodes.length).to.equal(0);
			parentNode.appendChild(widget.domNode);
			widget.startup();
			expect(parentNode.childNodes.length).to.equal(1);
			widget.destroy();
			expect(parentNode.childNodes.length).to.equal(0);
		});

		bdd.it('should mix in properties passed to constructor', function () {
			widget = new Widget({
				expectedProperty: 'expectedValue'
			});

			expect(widget).to.have.property('expectedProperty');
			expect(widget.expectedProperty).to.equal('expectedValue');
		});

		bdd.it('should use setters if present to mix in properties passed to the constructor', function () {
			var propertySetterCalled = false,
				valuePassedToSetter,
				CustomWidget = declare(Widget, {
					_expectedPropertySetter: function (value) {
						propertySetterCalled = true;
						valuePassedToSetter = value;
					}
				});

			widget = new CustomWidget({
				expectedProperty: 'expectedValue'
			});
			expect(propertySetterCalled).to.be.true;
			expect(valuePassedToSetter).to.equal('expectedValue');
		});

		bdd.it('should call remove() on all the handles it owns when the widget is destroyed', function () {
			var removeCounter = 3,
				handle = { remove: function () { removeCounter--; } };

			widget = new Widget();

			widget.own(handle, handle, handle);

			expect(removeCounter).to.equal(3);
			widget.destroy();
			expect(removeCounter).to.equal(0);
		});

		bdd.it('should apply styles to its DOM node', function () {
			var expectedBackgroundColor = 'green',
				expectedTextAlign = 'left';

			widget = new Widget({
				style: {
					backgroundColor: expectedBackgroundColor,
					textAlign: expectedTextAlign
				}
			});

			var style = widget.domNode.style;
			expect(style.backgroundColor).to.equal(expectedBackgroundColor);
			expect(style.textAlign).to.equal(expectedTextAlign);
		});

		bdd.it('should apply a CSS class to the widget when the className property is set', function () {
			widget = new Widget({
				className: 'expectedClassName'
			});
			expect(domClass.contains(widget.domNode, 'expectedClassName')).to.be.true;
		});

		bdd.it('should remove the previous CSS class applied via className when setting a new className', function () {
			widget = new Widget({
				className: 'unexpectedClassName'
			});
			widget.set('className', 'expectedClassName');
			expect(domClass.contains(widget.domNode, 'unexpectedClassName')).to.be.false;
			expect(domClass.contains(widget.domNode, 'expectedClassName')).to.be.true;
		});

		bdd.it('should add an event handler with on()', function () {
			widget = new Widget();

			var eventHandlerCalled = false;
			widget.on('expected-event', function () {
				eventHandlerCalled = true;
			});
			widget.emit('expected-event', {});
			expect(eventHandlerCalled).to.be.true;
		});

		bdd.it('should call event handler with the widget as \'this\'', function () {
			widget = new Widget();

			widget.on('expected-event', function () {
				expect(this).to.equal(widget);
			});
			widget.emit('expected-event', {});
		});

		// Widget for testing bubbling events.
		var NestedWidget = declare(Widget, {
			_nestedWidget: null,
			_create: function () {
				this.inherited(arguments);

				// Add a div between the two widgets to make sure events can bubble
				// up through HTML elements not associated with widgets.
				var anotherDiv = domConstruct.create('div');
				this.domNode.appendChild(anotherDiv);

				this._nestedWidget = new Widget();
				anotherDiv.appendChild(this._nestedWidget.domNode);
			},
			destroy: function () {
				this._nestedWidget.destroy();
				this.inherited(arguments);
			}
		});

		bdd.it('should bubble emitted events', function () {
			widget = new NestedWidget();

			var eventBubbled = false;
			widget.on('expected-event', function () {
				eventBubbled = true;
			});
			widget._nestedWidget.emit('expected-event', { bubbles: true });

			expect(eventBubbled).to.be.true;
		});

		bdd.it('should call event handler with current widget as \'this\' for bubbled events', function () {
			widget = new NestedWidget();

			var expectedHandlerContext = widget,
				actualHandlerContext;
			widget.on('expected-event', function () {
				actualHandlerContext = this;
			});
			widget._nestedWidget.emit('expected-event', { bubbles: true });

			expect(actualHandlerContext).to.equal(expectedHandlerContext);
		});

		bdd.it('should no longer call handlers after they have been removed', function () {
			widget = new Widget();

			var handlerCalled = false;
			var handle = widget.on('expected-event', function () {
				handlerCalled = true;
			});
			widget.emit('expected-event');
			expect(handlerCalled).to.be.true;

			handle.remove();
			handlerCalled = false;
			widget.emit('expected-event');
			expect(handlerCalled).to.be.false;
		});

		bdd.it('should stop bubbling an event when event.stopPropagation() is called', function () {
			widget = new NestedWidget();

			var eventBubbled = false;
			widget.on('expected-event', function () {
				eventBubbled = true;
			});
			widget._nestedWidget.on('expected-event', function (event) {
				event.stopPropagation();
			});
			widget._nestedWidget.emit('expected-event', { bubbles: true });

			expect(eventBubbled).to.be.false;
		});

		bdd.it('should return false from emit() if an event is canceled with preventDefault()', function () {
			widget = new Widget();

			widget.on('expected-event', function (event) {
				event.preventDefault();
			});
			var emitReturnValue = widget.emit('expected-event', { cancelable: true });

			expect(emitReturnValue).to.be.false;
		});
	});
});