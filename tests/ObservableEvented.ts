/// <reference path="./intern" />

import core = require('../interfaces');
import Event = require('../Event');
import registerSuite = require('intern!object');
import assert = require('intern/chai!assert');
import ObservableEvented = require('../ObservableEvented');

class TestEvent extends Event {
	value:string;
}

registerSuite({
	name: 'ObservableEvented',
	
	'#on and #emit event type transform' () {
		var observableEvented = new ObservableEvented({
				'ontest': 'newEvent'
			}),
			emittedEvent:any,
			listenerCallCount = 0;
		
		observableEvented.on('newEvent', function (actualEvent:TestEvent) {
			listenerCallCount++;
			assert.strictEqual(actualEvent.sourceEvent.value, emittedEvent.value);
		});
		

		emittedEvent = new TestEvent({ type: 'test', value: 'foo'});
		observableEvented.emit(emittedEvent);
		assert.strictEqual(listenerCallCount, 1);

		emittedEvent = new TestEvent({ type: 'test', value: 'bar'});
		observableEvented.emit(emittedEvent);
		assert.strictEqual(listenerCallCount, 2);
	
	},

	'#on and #emit function method' () {
		var observableEvented = new ObservableEvented({
				'ontest': function (actualEvent:TestEvent) {
					listenerCallCount++;
					assert.strictEqual(actualEvent.value, emittedEvent.value);
				}	
			}),
			emittedEvent:any,
			listenerCallCount = 0;

		emittedEvent = new TestEvent({ type: 'test', value: 'foo'});
		observableEvented.emit(emittedEvent);
		assert.strictEqual(listenerCallCount, 1);

		emittedEvent = new TestEvent({ type: 'test', value: 'bar'});
		observableEvented.emit(emittedEvent);
		assert.strictEqual(listenerCallCount, 2);
	
	},

	'#on and #emit bubbles' () {
		var observableEvented = new ObservableEvented(),
			parentEvented = new ObservableEvented(),
			emittedEvent:any,
			listenerCallCount = 0;

		parentEvented.on('test', function (actualEvent:TestEvent) {
			listenerCallCount++;
			assert.strictEqual(actualEvent.value, emittedEvent.value);
		});

		observableEvented.set('parent', parentEvented);

		emittedEvent = new TestEvent({ type: 'test', value: 'foo', bubbles: true });
		observableEvented.emit(emittedEvent);
		assert.strictEqual(listenerCallCount, 1);

		emittedEvent = new TestEvent({ type: 'test', value: 'bar', bubbles: true });
		observableEvented.emit(emittedEvent);
		assert.strictEqual(listenerCallCount, 2);
	
	},

	'#on and #emit' () {
		var observableEvented = new ObservableEvented(),
			emittedEvent:any,
			listenerCallCount = 0;

		observableEvented.on('test', function (actualEvent:TestEvent) {
			listenerCallCount++;
			assert.strictEqual(actualEvent.value, emittedEvent.value);
		});

		emittedEvent = new TestEvent({ type: 'test', value: 'foo' });
		observableEvented.emit(emittedEvent);
		assert.strictEqual(listenerCallCount, 1);

		emittedEvent = new TestEvent({ type: 'test', value: 'bar' });
		observableEvented.emit(emittedEvent);
		assert.strictEqual(listenerCallCount, 2);
	},

	'#on supports extension events' () {
		var observableEvented = new ObservableEvented(),
			extensionEvent = (object:IEvented, listenerCallback:EventListener) => {
				var handles = [
					object.on('foo', listenerCallback),
					object.on('bar', listenerCallback)
				];
				return {
					remove () {
						while (handles.length > 0) {
							handles.pop().remove();
						}
					}
				};
			},
			emittedEvent:any,
			listenerCallCount = 0;

		observableEvented.on(extensionEvent, function (actualEvent:TestEvent) {
			listenerCallCount++;
			assert.strictEqual(actualEvent.value, emittedEvent.value);
		});

		emittedEvent = new TestEvent({ type: 'foo', value: 'baz' });
		observableEvented.emit(emittedEvent);
		assert.strictEqual(listenerCallCount, 1);

		emittedEvent = new TestEvent({ type: 'bar', value: 'quux' });
		observableEvented.emit(emittedEvent);
		assert.strictEqual(listenerCallCount, 2);
	},

	'#on returns a handle for removing the listener' () {
		var observableEvented = new ObservableEvented(),
			listenerCalled = false;

		var handle = observableEvented.on('test', function () {
			listenerCalled = true;
		});
		handle.remove();

		observableEvented.emit(new TestEvent({ type: 'test', value: 'foo' }));
		assert.isFalse(listenerCalled);
	},

	'listener order' () {
		var observableEvented = new ObservableEvented(),
			order:any[] = [];

		observableEvented.on('testevent', function () {
			order.push(1);
		});
		observableEvented.on('testevent', function () {
			order.push(2);
		});
		observableEvented.on('testevent', function () {
			order.push(3);
		});

		observableEvented.emit(new TestEvent({ type: 'testevent' }));
		assert.deepEqual(order, [ 1, 2, 3 ]);
	}
});
