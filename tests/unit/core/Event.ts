import assert = require('intern/chai!assert');
import Event = require('../../../Event');
import registerSuite = require('intern!object');

registerSuite({
	name: 'mayhem/Event',

	'#constructor': {
		'sets values from kwArgs'() {
			var event = new Event({
				currentTarget: { value: 'test currentTarget' },
				target: { value: 'test target' },
				constructor: 'invalid'
			});

			assert.strictEqual(event.currentTarget.value, 'test currentTarget');
			assert.strictEqual(event.target.value, 'test target');
			assert.notStrictEqual(event.constructor, 'invalid');
		},

		'accepts no kwArgs'() {
			var event:Event;
			assert.doesNotThrow(function () {
				event = new Event();
			});
			assert.isUndefined(event.currentTarget);
		},

		'default values'() {
			var event = new Event();

			assert.isTrue((+new Date()) >= event.timestamp, 'timestamp should not be greater than the current time');
		}
	},

	'#preventDefault'() {
		var event = new Event({
			cancelable: true,
			defaultPrevented: false
		});

		event.preventDefault();
		assert.isTrue(event.defaultPrevented, 'preventDefault should set defaultPrevented when an event is cancelable');

		event = new Event({
			cancelable: false,
			defaultPrevented: false
		});
		event.preventDefault();
		assert.isFalse(event.defaultPrevented, 'preventDefault should have no effect when an event is not cancelable');
	},

	'#stopImmediatePropagation'() {
		var event = new Event({
			bubbles: true,
			immediatePropagationStopped: false
		});

		event.stopImmediatePropagation();
		assert.isTrue(event.immediatePropagationStopped,
			'stopImmediatePropagation should set immediatePropagationStopped');

		event.bubbles = false;
		event.immediatePropagationStopped = false;
		event.stopImmediatePropagation();
		assert.isFalse(event.immediatePropagationStopped, 'stopImmediatePropagation should have no effect');
	},

	'#stopPropagation'() {
		var event = new Event({
			bubbles: true,
			propagationStopped: false
		});

		event.stopPropagation();
		assert.isTrue(event.propagationStopped, 'stopPropagation should set propagationStopped');

		event.bubbles = false;
		event.propagationStopped = false;
		event.stopPropagation();
		assert.isFalse(event.propagationStopped, 'stopPropagation should have no effect');
	}
});
