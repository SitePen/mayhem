import actions = require('mayhem/ui/dom/actions');
import assert = require('intern/chai!assert');
import Container = require('mayhem/ui/dom/Container');
import DomMaster = require('mayhem/ui/dom/Master');
import Event = require('mayhem/Event');
import has = require('intern/dojo/has');
import registerSuite = require('intern!object');
import SingleNodeWidget = require('mayhem/ui/dom/SingleNodeWidget');
import WebApplication = require('../../../support/MockWebApplication');
import Widget = require('mayhem/ui/dom/Widget');
import util = require('mayhem/util');

var app:WebApplication;
var container:Container;
var childA:Widget;

class SNW extends SingleNodeWidget {
	_render() {
		var node = document.createElement('div');
		node.style.width = '30px';
		node.style.height = '30px';
		node.style.backgroundColor = '#0f0';
		this._node = node;
	}
}

registerSuite({
	name: 'mayhem/ui/dom/util',

	beforeEach() {
		if (!has('host-browser')) {
			return;
		}

		app = new WebApplication({
			components: {
				router: null,
				ui: {
					view: null,
					root: document.createElement('div')
				}
			}
		});

		return app.run().then(function () {
			container = new Container({ app, id: 'container' });
			childA = new SNW({ app, id: 'a' });
			container.add(childA);

			var master = <DomMaster> app.get('ui');
			master.set('view', container);
		});
	},

	afterEach() {
		if (!has('host-browser')) {
			return;
		}

		app.destroy();
	},

	'activate': {
		'basic'() {
			if (!has('host-browser')) {
				this.skip('DOM-only test');
			}

			var actual:string[] = [];
			var expected = [ 'childA', 'container' ];

			childA.on('activate', function (event) {
				actual.push('childA');
			});
			container.on('activate', function (event) {
				actual.push('container');
			});

			childA.emit(new Event({
				bubbles: true,
				cancelable: true,
				buttons: 1,
				numClicks: 1,
				target: childA,
				type: actions.click.symbol
			}));

			assert.deepEqual(actual, expected, 'Activate event should occur when criteria for pointer activation are met');

			actual = [];
			childA.emit(new Event({
				bubbles: true,
				cancelable: true,
				key: 'Enter',
				target: childA,
				type: 'keyup'
			}));

			assert.deepEqual(actual, expected, 'Activate event should occur when criteria for keyboard activation are met');
		},
		'stopPropagation'() {
			if (!has('host-browser')) {
				this.skip('DOM-only test');
			}

			var actual:string[] = [];
			var expected = [ 'click childA', 'click container', 'childA' ];

			childA.on('click', function (event) {
				actual.push('click childA');
			});
			container.on('click', function (event) {
				actual.push('click container');
			});

			childA.on('activate', function (event) {
				actual.push('childA');
				event.stopPropagation();
			});
			container.on('activate', function (event) {
				actual.push('container');
			});

			childA.emit(new Event({
				bubbles: true,
				cancelable: true,
				buttons: 1,
				numClicks: 1,
				target: childA,
				type: actions.click.symbol
			}));

			assert.deepEqual(actual, expected, 'Activate event should stop bubbling without impacting underlying event');
		}
	},

	'click': {
		'basic'() {
			if (!has('host-browser')) {
				this.skip('DOM-only test');
			}

			var actual:string[] = [];
			var expected = [ 'childA', 'container' ];

			childA.on('click', function (event) {
				actual.push('childA');
			});
			container.on('click', function (event) {
				actual.push('container');
			});

			childA.emit(new Event({
				bubbles: true,
				button: 1,
				buttons: 1,
				cancelable: true,
				clientX: 0,
				clientY: 0,
				isPrimary: true,
				pointerType: 'mouse',
				target: childA,
				type: 'pointerdown'
			}));

			childA.emit(new Event({
				bubbles: true,
				button: 1,
				buttons: 0,
				cancelable: true,
				clientX: 0,
				clientY: 0,
				isPrimary: true,
				pointerType: 'mouse',
				target: childA,
				type: 'pointerup'
			}));

			assert.deepEqual(actual, expected, 'Click event should occur when criteria for pointer activation are met');
		},
		'stopPropagation'() {
			if (!has('host-browser')) {
				this.skip('DOM-only test');
			}

			var actual:string[] = [];
			var expected = [ 'childA' ];

			childA.on('click', function (event) {
				actual.push('childA');
				event.stopPropagation();
			});
			container.on('click', function (event) {
				actual.push('container');
			});

			childA.emit(new Event({
				bubbles: true,
				button: 1,
				buttons: 1,
				cancelable: true,
				clientX: 0,
				clientY: 0,
				isPrimary: true,
				pointerType: 'mouse',
				target: childA,
				type: 'pointerdown'
			}));

			childA.emit(new Event({
				bubbles: true,
				button: 1,
				buttons: 0,
				cancelable: true,
				clientX: 0,
				clientY: 0,
				isPrimary: true,
				pointerType: 'mouse',
				target: childA,
				type: 'pointerup'
			}));

			assert.deepEqual(actual, expected, 'Click event should stop bubbling when propagation is stopped');
		}
	}
});
