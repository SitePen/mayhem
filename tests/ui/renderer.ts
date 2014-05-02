/// <reference path="../intern" />

import assert = require('intern/chai!assert');
import aspect = require('dojo/aspect');
import _BaseRenderer = require('../../ui/dom/_Base');
import has = require('../../has');
import registerSuite = require('intern!object');
import renderer = require('../../ui/renderer');

registerSuite({
	name: 'ui/renderer',

	load():void {
		// check that renderer can load modules
		var dfd = this.async(2000);
		renderer.load('mayhem/ui/dom/_Base', null, dfd.callback(function (mod:any):void {
			assert.strictEqual(mod.toString(), _BaseRenderer.toString());
		}));
	},

	normalize():void {
		// check that renderer normalizes resource IDs as expected
		var platform = has('host-browser') ? 'dom/' : 'default/',
			expected = new RegExp('(framework\/|mayhem\/)?ui\/' + platform + 'Widget'),
			normalized = renderer.normalize('../../ui/dom/Widget', null);
		assert.match(normalized, expected);
	}
});
