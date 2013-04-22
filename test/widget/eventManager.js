define([
	'teststack!bdd',
	'teststack/chai!expect',
	'../../widget/eventManager',
	'../../widget/Widget',
	'./helpers/NestedWidget',
	'dojo/dom-construct',
	'dojo/dom-class',
	'dojo/_base/declare',
	'dojo/aspect',
	'dojo/domReady!'
], function (bdd, expect, eventManager, Widget, NestedWidget, domConstruct, domClass, declare, aspect) {

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

		bdd.it('should define a boolean .bubbles property on all emitted events', function () {
			widget = new Widget();

			var emittedEvent;
			eventManager.add(widget, 'expected-event', function (event) {
				emittedEvent = event;
			});
			eventManager.emit(widget, 'expected-event');
			expect(emittedEvent).to.be.an('object');
			expect(emittedEvent.bubbles).to.be.a('boolean');
		});

		bdd.it('should define a boolean .cancelable property on all emitted events', function () {
			widget = new Widget();

			var emittedEvent;
			eventManager.add(widget, 'expected-event', function (event) {
				emittedEvent = event;
			});
			eventManager.emit(widget, 'expected-event');
			expect(emittedEvent).to.be.an('object');
			expect(emittedEvent.cancelable).to.be.a('boolean');
		});

		bdd.it('should bubble bubblable events', function () {
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

		bdd.it('should call the initializeSharedListener function when when adding the first listener for a widget\'s event', function () {
			widget = new Widget();

			var calledSharedListener = false;
			function initializeSharedListener() {
				calledSharedListener = true;
			}
			function listenerNoOp() {}

			eventManager.add(widget, 'some-event', listenerNoOp, initializeSharedListener);
			expect(calledSharedListener).to.be.true;
		});

		bdd.it('should not call the initializeSharedListener function when adding additional listeners for a widget\'s event', function () {
			widget = new Widget();

			var calledSharedListener = false;
			function initializeSharedListener() {
				calledSharedListener = true;
			}
			function listenerNoOp() {}

			eventManager.add(widget, 'some-event', listenerNoOp, initializeSharedListener);
			expect(calledSharedListener).to.be.true;
			calledSharedListener = false;
			eventManager.add(widget, 'some-event', listenerNoOp, initializeSharedListener);
			expect(calledSharedListener).to.be.false;
		});

		bdd.it('should call the shared listener\'s remove() when all listeners have been removed', function () {
			widget = new Widget();

			var calledSharedListenerRemove = false;
			function initializeSharedListener() {
				return {
					remove: function () { calledSharedListenerRemove = true; }
				};
			}
			function listenerNoOp() {}

			var listenerHandle1 = eventManager.add(widget, 'some-event', listenerNoOp, initializeSharedListener),
				listenerHandle2 = eventManager.add(widget, 'some-event', listenerNoOp, initializeSharedListener);

			expect(calledSharedListenerRemove).to.be.false;
			listenerHandle1.remove();
			expect(calledSharedListenerRemove).to.be.false;
			listenerHandle2.remove();
			expect(calledSharedListenerRemove).to.be.true;
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