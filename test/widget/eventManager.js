define([
	'teststack!bdd',
	'teststack/chai!expect',
	'../../widget/eventManager',
	'../../widget/Widget',
	'dojo/dom-construct',
	'dojo/dom-class',
	'dojo/_base/declare',
	'dojo/aspect',
	'dojo/domReady!'
], function (bdd, expect, eventManager, Widget, domConstruct, domClass, declare, aspect) {

	bdd.describe('eventManager', function () {

		var parentNode,
			widget,
			listenerHandles = [];

		bdd.beforeEach(function () {
			parentNode = domConstruct.create('div', null, document.body);
		});

		// Remember all listener handles so they can be removed at the end of each test.
		aspect.after(eventManager, 'add', function (listenerHandle) {
			listenerHandles.push(listenerHandle);
			return listenerHandle;
		});

		bdd.afterEach(function () {
			if (widget) {
				widget.destroy();
				widget = null;
			}
			domConstruct.destroy(parentNode);
			parentNode = null;

			while (listenerHandles.length > 0) {
				listenerHandles.shift().remove();
			}
		});

		// Widget for testing bubbling events.
		var NestedWidget = declare(Widget, {
			_innerWidget: null,
			_create: function () {
				this.inherited(arguments);

				// Add a div between the two widgets to make sure events can bubble
				// up through HTML elements not associated with widgets.
				var anotherDiv = domConstruct.create('div');
				this.domNode.appendChild(anotherDiv);

				this._innerWidget = new Widget();
				anotherDiv.appendChild(this._innerWidget.domNode);
			},
			destroy: function () {
				this._innerWidget.destroy();
				this.inherited(arguments);
			}
		});

		bdd.it('should add a widget event listener with eventManager.add()', function () {
			widget = new Widget();

			var eventListenerCalled = false;
			eventManager.add(widget, 'expected-event', function () {
				eventListenerCalled = true;
			});
			eventManager.emit(widget, 'expected-event', {});
			expect(eventListenerCalled).to.be.true;
		});

		bdd.it('should call event listener with the widget as \'this\'', function () {
			widget = new Widget();

			eventManager.add(widget, 'expected-event', function () {
				expect(this).to.equal(widget);
			});
			eventManager.emit(widget, 'expected-event', {});
		});

		bdd.it('should reflect the type of an emitted event in the event\'s type property', function () {
			widget = new Widget();

			eventManager.add(widget, 'expected-event', function (event) {
				expect(event.type).to.equal('expected-event');
			});
			eventManager.emit(widget, 'expected-event', {});
		});

		bdd.it('should bubble emitted events', function () {
			widget = new NestedWidget();

			var eventBubbled = false;
			eventManager.add(widget, 'expected-event', function () {
				eventBubbled = true;
			});
			eventManager.emit(widget._innerWidget, 'expected-event', { bubbles: true });

			expect(eventBubbled).to.be.true;
		});

		bdd.it('should call event listener with current widget as \'this\' for bubbled events', function () {
			widget = new NestedWidget();

			var expectedListenerContext = widget,
				actualListenerContext;
			eventManager.add(widget, 'expected-event', function () {
				actualListenerContext = this;
			});
			eventManager.emit(widget._innerWidget, 'expected-event', { bubbles: true });

			expect(actualListenerContext).to.equal(expectedListenerContext);
		});

		bdd.it('should no longer call listeners after they have been removed', function () {
			widget = new Widget();

			var listenerCalled = false;
			var handle = eventManager.add(widget, 'expected-event', function () {
				listenerCalled = true;
			});
			eventManager.emit(widget, 'expected-event');
			expect(listenerCalled).to.be.true;

			handle.remove();
			listenerCalled = false;
			eventManager.emit(widget, 'expected-event');
			expect(listenerCalled).to.be.false;
		});

		bdd.it('should stop bubbling an event when event.stopPropagation() is called', function () {
			widget = new NestedWidget();

			var eventBubbled = false;
			eventManager.add(widget, 'expected-event', function () {
				eventBubbled = true;
			});
			eventManager.add(widget._innerWidget, 'expected-event', function (event) {
				event.stopPropagation();
			});
			eventManager.emit(widget._innerWidget, 'expected-event', { bubbles: true });

			expect(eventBubbled).to.be.false;
		});

		bdd.it('should emit DOM events if a listener is registered for them', function () {
			widget = new Widget();
			document.body.appendChild(widget.domNode);
			widget.startup();

			var emittedClick = false;
			eventManager.add(widget, 'click', function () {
				emittedClick = true;
			});
			widget.domNode.click();

			expect(emittedClick).to.be.true;
		});

		bdd.it('should stop emitting DOM events once all listeners have been removed', function () {
			widget = new Widget();
			document.body.appendChild(widget.domNode);
			widget.startup();

			var handle = eventManager.add(widget, 'click', function () {});

			var calledEmit = false;
			var aspectHandle;
			try {
				aspectHandle = aspect.before(eventManager, 'emit', function () {
					calledEmit = true;
				});

				widget.domNode.click();
				expect(calledEmit).to.be.true;

				handle.remove();

				calledEmit = false;
				widget.domNode.click();
				expect(calledEmit).to.be.false;
			}
			finally {
				aspectHandle.remove();
			}
		});

		bdd.it('should return false from emit() if an event is canceled', function () {
			widget = new Widget();

			eventManager.add(widget, 'expected-event', function (event) {
				event.preventDefault();
			});
			var emitReturnValue = eventManager.emit(widget, 'expected-event', { cancelable: true });

			expect(emitReturnValue).to.be.false;
		});

		bdd.it('should return true from emit() if a cancelable event is not canceled', function () {
			widget = new Widget();

			eventManager.add(widget, 'expected-event', function () {});
			var emitReturnValue = eventManager.emit(widget, 'expected-event', { cancelable: true });

			expect(emitReturnValue).to.be.true;
		});

		bdd.it('should call originating event\'s preventDefault() when widget event\'s preventDefault() is called', function () {
			widget = new Widget();

			var preventDefaultCalled = false;
			eventManager.add(widget, 'expected-event', function (event) {
				event.preventDefault();
			});
			eventManager.emit(widget, 'expected-event', {
				cancelable: true,
				preventDefault: function () {
					preventDefaultCalled = true;
				}
			});

			expect(preventDefaultCalled).to.be.true;
		});
	});
});