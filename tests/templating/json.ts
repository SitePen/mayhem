/// <reference path="../intern" />

import assert = require('intern/chai!assert');
import registerSuite = require('intern!object');
import Template = require('../../templating/json');

registerSuite({
	name: 'templating/json',

	'#parse': function () {
		// The json parser doesn't do any structural validation, it just parses JSON
		assert.doesNotThrow(function () {
			Template.parse('{"constructor":"foo", "kwArgs":{"title":"test", "name":"{name}"}}');
		});
		assert.throws(function () {
			Template.parse('<widget></widget>');
		});
	},

	'#normalize': function () {
		var normalized:string;
		Template.normalize('foo/bar', function (id) {
			return normalized = id;
		});
		assert.strictEqual(normalized, 'foo/bar.json', 'Path should be normalized');
	}
});
