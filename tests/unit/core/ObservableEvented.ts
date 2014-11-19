/// <reference path="../../intern" />
import assert = require('intern/chai!assert');
import Event = require('../../../Event');
import ObservableEvented = require('../../../ObservableEvented');
import registerSuite = require('intern!object');

registerSuite({
	name: 'mayhem/ObservableEvented',

	'#emit/on'() {
		var evented = new ObservableEvented();
		var count = 0;
		var event = new Event({
			type: 'test'
		});

		evented.on('test', function (event) {
			assert.isUndefined(event.foo);
			count++;
		});
		evented.emit(event);
		assert.strictEqual(count, 1, 'Event count should have been incremented');

		evented.on('test', function (event) {
			assert.strictEqual(event.bar, 'bar', 'Event should have custom property');
		});
		event.bar = 'bar';
		evented.emit(event);
		assert.strictEqual(count, 2, 'Event count should have been incremented');
	}
});
