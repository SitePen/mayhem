/// <reference path="../../intern"/>
/// <reference path="../../../dojo"/>

import assert = require('intern/chai!assert');
import registerSuite = require('intern!object');
import actions = require('../../../ui/dom/actions');
import Widget = require('../../../ui/Widget');
import _ElementRenderer = require('../../../ui/dom/_Element');
import on = require('dojo/on');

var widget:any,
	action:actions.Action,
	handle:any;

registerSuite({
	name: 'ui/dom/actions',

	setup():void {
		Widget.prototype._renderer = new _ElementRenderer();
	},

	teardown():void {
		Widget.prototype._renderer = undefined;
	},

	beforeEach():void {
		widget = new Widget();
	},

	'Action': {
		beforeEach():void {
			action = new actions.Action();
			action.name = 'test';
			handle = action.attach(widget);
		},

		'#trigger': function ():void {
			var eventEmitted:boolean = false;
			on(widget, 'test', ():void => {
				eventEmitted = true;
			});

			action.trigger(widget);
			assert.isTrue(eventEmitted);
		},

		'#trigger - paused': function ():void {
			var eventEmitted:boolean = false;
			on(widget, 'test', ():void => {
				eventEmitted = true;
			});

			handle.pause();
			action.trigger(widget);
			assert.isFalse(eventEmitted);
		},

		'#trigger - resume': function ():void {
			var eventEmitted:boolean = false;
			on(widget, 'test', ():void => {
				eventEmitted = true;
			});

			handle.pause();
			action.trigger(widget);
			assert.isFalse(eventEmitted);

			handle.resume();
			action.trigger(widget);
			assert.isTrue(eventEmitted);
		},

		// '#trigger - remove': function ():void {
		// 	var eventEmitted:boolean = false;
		// 	on(widget, 'test', ():void => {
		// 		eventEmitted = true;
		// 	});

		// 	handle.remove();
		// 	action.trigger(widget);
		// 	assert.isFalse(eventEmitted);
		// }
	},

	'Press': {
		'#attach': function ():void {
			var press = new actions.Press();
			press.role = 'button';
			var handle = press.attach(widget);
			assert.isFunction(handle.remove, 'should remove a remove handle');

			widget.set('selected', true);
			assert.isTrue(widget.classList.has('selected'));
		}
	},

	'CheckboxPress': {
		'#perform': function ():void {
			var press = new actions.CheckboxPress();
			press.perform(widget);
			assert.isTrue(widget.get('selected'));
			press.perform(widget);
			assert.isFalse(widget.get('selected'));
		}
	},

	'RadioPress': {
		'#perform': function ():void {
			var press = new actions.RadioPress();
			press.perform(widget);
			assert.isTrue(widget.get('selected'));
			press.perform(widget);
			assert.isTrue(widget.get('selected'));
		},

		'#trigger': function ():void {
			var action = new actions.RadioPress(),
				eventEmitted:boolean = false;

			action.name = 'test';

			on(widget, 'test', ():void => {
				eventEmitted = true;
			});

			widget.set('selected', true);
			action.trigger(widget);
			assert.isFalse(eventEmitted);

			widget.set('selected', false);
			action.trigger(widget);
			assert.isTrue(eventEmitted);
		}
	},

	'LinkPress': {
		'#perform': function ():void {
			var press = new actions.LinkPress();
			press.perform(widget);
			assert.isUndefined(widget.get('selected'));
			widget.set('selected', true);
			press.perform(widget);
			assert.isTrue(widget.get('selected'));
		}
	},

	'ButtonPress': {
		'#perform': function ():void {
			var press = new actions.ButtonPress();
			press.perform(widget);
			assert.isUndefined(widget.get('hidden'));
			widget.set('hidden', true);
			press.perform(widget);
			assert.isTrue(widget.get('hidden'));
		}
	},

	'DialogDismiss': {
		'#perform': function ():void {
			var press = new actions.DialogDismiss();
			press.perform(widget);
			assert.isTrue(widget.get('hidden'));
		},

		'#trigger': function ():void {
			var action = new actions.DialogDismiss(),
				eventEmitted:boolean = false;

			on(widget, 'dismiss', ():void => {
				eventEmitted = true;
			});

			widget.set('hidden', true);
			action.trigger(widget);
			assert.isFalse(eventEmitted);

			widget.set('hidden', false);
			action.trigger(widget);
			assert.isTrue(eventEmitted);
		}
	},

	'DialogShow': {
		'#perform': function ():void {
			var press = new actions.DialogShow();
			press.perform(widget);
			assert.isFalse(widget.get('hidden'));
		},

		'#trigger': function ():void {
			var action = new actions.DialogShow(),
				eventEmitted:boolean = false;

			on(widget, 'show', ():void => {
				eventEmitted = true;
			});

			widget.set('hidden', false);
			action.trigger(widget);
			assert.isFalse(eventEmitted);

			widget.set('hidden', true);
			action.trigger(widget);
			assert.isTrue(eventEmitted);
		}
	}
});
