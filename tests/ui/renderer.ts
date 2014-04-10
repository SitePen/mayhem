/// <reference path="../intern" />

import has = require('../../has');
import assert = require('intern/chai!assert');
import aspect = require('dojo/aspect');
import registerSuite = require('intern!object');
import renderer = require('../../ui/renderer');
import Widget = require('../../ui/dom/Widget');

registerSuite({
	name: 'ui/dom/util',

	load() {
		// check that renderer can load modules
		var dfd = this.async(2000);
		renderer.load('mayhem/ui/dom/Widget', null, dfd.callback(function (mod:any) {
			assert.strictEqual(mod, Widget);
		}));
	},

	normalize() {
		// check that renderer normalizes resource IDs as expected
		var platform = has('host-browser') ? 'dom/' : 'default/',
			expected = 'mayhem/ui/' + platform + 'Widget',
			normalized = renderer.normalize('../../ui/dom/Widget', null);
		assert.strictEqual(expected, normalized);
	}
});
