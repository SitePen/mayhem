import assert = require('intern/chai!assert');
import html = require('mayhem/templating/html');
import MockWebApplication = require('../../support/MockWebApplication');
import Promise = require('mayhem/Promise');
import registerSuite = require('intern!object');
import Widget = require('mayhem/ui/Widget');

var app:MockWebApplication;
var root:HTMLDivElement;

registerSuite({
	name: 'mayhem/templating/html',

	beforeEach() {
		root = document.createElement('div');
		document.body.appendChild(root);

		app = new MockWebApplication({
			components: {
				ui: {
					root
				}
			}
		});

		return app.run();
	},

	afterEach() {
		app.destroy();
		root.parentNode.removeChild(root);
	},

	'basic tests'() {
		var dfd = this.async();

		html.create('<span>Hello</span>, <span>{name}</span>').then(dfd.rejectOnError(function (Ctor:typeof Widget) {
			var model = { name: 'World' };
			var view = new Ctor({ app, model });

			app.get('ui').set({
				root,
				view
			});

			assert.strictEqual(root.textContent, 'Hello, World');
			model.name = 'Universe';

			// TODO: Deferred call should not be necessary without a scheduler; find where asynchronicity is being
			// introduced and remove it
			requestAnimationFrame(dfd.callback(function () {
				assert.strictEqual(root.textContent, 'Hello, Universe');
			}));
		}), dfd.reject.bind(dfd));
	}
});
