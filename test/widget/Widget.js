define([
	'teststack!bdd',
	'teststack/chai!expect',
	'../../widget/Widget',
	'./helpers/NestedWidget',
	'dojo/dom-construct',
	'dojo/dom-class',
	'dojo/_base/declare',
	'dojo/aspect',
	'dojo/domReady!'
], function (bdd, expect, Widget, NestedWidget, domConstruct, domClass, declare) {

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

		bdd.it('should assign a widget id if none is provided', function () {
			widget = new Widget();
			expect(widget.id).to.not.be.null;
		});

		bdd.it('should use a provided widget id in the event one is provided', function () {
			widget = new Widget({ id: 'expectedId' });
			expect(widget.id).to.equal('expectedId');
		});

		bdd.it('should assign the widget id to the widget\'s DOM node', function () {
			widget = new Widget();
			expect(widget.domNode.id).to.equal(widget.id);
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

		bdd.it('should destroy widget descendents in a post-order depth-first traversal', function () {
			var destroyedWidgets = [];
			var DestroyLoggingWidget = declare(Widget, {
				number: null,
				_destroy: function () {
					destroyedWidgets.push(this.number);
				}
			});
			// TODO: Update this hacky composition with one that uses the container interface once it is merged into Widget.
			var ComplexWidget = declare(DestroyLoggingWidget, {
				number: 5,
				_create: function () {
					this.inherited(arguments);

					// Child 1
					var child1 = this.child1 = new DestroyLoggingWidget({ number: 3 }),
						grandChild1 = this.grandChild1 = new DestroyLoggingWidget({ number: 1 }),
						grandChild2 = this.grandChild2 = new DestroyLoggingWidget({ number: 2 }),
						child2 = this.child2 = new DestroyLoggingWidget({ number: 4 });

					this.domNode.appendChild(child1.domNode);
					child1.domNode.appendChild(grandChild1.domNode);
					child1.domNode.appendChild(grandChild2.domNode);
					this.domNode.appendChild(child2.domNode);
				},
				startup: function () {
					this.child1.startup();
					this.grandChild1.startup();
					this.grandChild2.startup();
					this.child2.startup();
				}
			});

			widget = new ComplexWidget();
			widget.startup();
			widget.destroy();

			expect(destroyedWidgets).to.deep.equal([ 1, 2, 3, 4, 5 ]);
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

		bdd.it('should add an event listener with widget.on()', function () {
			widget = new Widget();

			var eventListenerCalled = false;
			widget.on('expected-event', function () {
				eventListenerCalled = true;
			});
			widget.emit('expected-event');
			expect(eventListenerCalled).to.be.true;
		});

		bdd.it('should call event listener with the widget as \'this\'', function () {
			widget = new Widget();

			widget.on('expected-event', function () {
				expect(this).to.equal(widget);
			});
			widget.emit('expected-event');
		});

		bdd.it('should no longer call a listener after it has been removed', function () {
			widget = new Widget();

			var listenerCalled = false;
			var handle = widget.on('expected-event', function () {
				listenerCalled = true;
			});
			widget.emit('expected-event');
			expect(listenerCalled).to.be.true;

			handle.remove();
			listenerCalled = false;
			widget.emit('expected-event');
			expect(listenerCalled).to.be.false;
		});

		bdd.it('should stop DOM event bubbling when emitting a corresponding bubbling widget event', function () {
			widget = new NestedWidget();
			parentNode.appendChild(widget.domNode);
			widget.startup();

			var outerListenerCallCount = 0,
				innerListenerCallCount = 0;
			function outerListener() { outerListenerCallCount++; }
			function innerListener() { innerListenerCallCount++; }

			widget.on('click', outerListener);
			widget._innerWidget.on('click', innerListener);
			widget._innerWidget.domNode.click();

			// Expect each listener to have been called once.
			// If the outer widget had received the DOM event, it would have emitted an additional 'click' event.
			expect(outerListenerCallCount).to.equal(1);
			expect(innerListenerCallCount).to.equal(1);
		});
	});
});