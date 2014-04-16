/// <reference path="../intern" />

import assert = require('intern/chai!assert');
import aspect = require('dojo/aspect');
import _BaseRenderer = require('../../ui/dom/_Base');
import has = require('../../has');
import registerSuite = require('intern!object');
import renderer = require('../../ui/renderer');

registerSuite({
	name: 'ui/dom/util',

	load() {
		// check that renderer can load modules
		var dfd = this.async(2000);
		renderer.load('mayhem/ui/dom/_Base', null, dfd.callback(function (mod:any) {
			assert.strictEqual(mod, _BaseRenderer);
		}));
	},

	normalize() {
		// check that renderer normalizes resource IDs as expected
		var platform = has('host-browser') ? 'dom/' : 'default/',
			expected = 'mayhem/ui/' + platform + 'Widget',
			normalized = renderer.normalize('../../ui/dom/_Base', null);
		assert.strictEqual(expected, normalized);
	}
});
