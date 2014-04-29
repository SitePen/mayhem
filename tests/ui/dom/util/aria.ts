/// <reference path="../../../intern"/>
/// <reference path="../../../../dojo"/>

import aria = require('../../../../ui/dom/util/aria')
import registerSuite = require('intern!object');
import assert = require('intern/chai!assert');

registerSuite({
	name: 'ui/om/util/aria',

	'getStateName': function () {
		assert.strictEqual(aria.getStateName('button', 'selected'), 'aria-pressed');
		assert.strictEqual(aria.getStateName('checkbox', 'selected'), 'aria-checked');
		assert.strictEqual(aria.getStateName('menuitemcheckbox', 'selected'), 'aria-checked');
		assert.strictEqual(aria.getStateName('radio', 'selected'), 'aria-checked');
		assert.strictEqual(aria.getStateName('menuitemradio', 'selected'), 'aria-checked');
		assert.isUndefined(aria.getStateName(null, 'selected'));
		assert.isUndefined(aria.getStateName('button', null));
	},

	'setState': function () {
		var button = document.createElement('button');
		aria.setState(button, 'aria-pressed', true);
		assert.strictEqual(button.getAttribute('aria-pressed'), 'true');
		aria.setState(button, 'aria-pressed', false);
		assert.strictEqual(button.getAttribute('aria-pressed'), 'false');
		aria.setState(button, 'not-aria-attribute', true);
		assert.isNull(button.getAttribute('not-aria-attribute'));
	}
});
