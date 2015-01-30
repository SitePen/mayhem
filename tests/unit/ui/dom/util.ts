/// <reference path="../../../intern" />

import assert = require('intern/chai!assert');
import Container = require('../../../../ui/dom/Container');
import domUtil = require('../../../../ui/dom/util');
import DomMaster = require('../../../../ui/dom/Master');
import has = require('intern/dojo/has');
import MultiNodeWidget = require('../../../../ui/dom/MultiNodeWidget');
import registerSuite = require('intern!object');
import SingleNodeWidget = require('../../../../ui/dom/SingleNodeWidget');
import WebApplication = require('../../../support/MockWebApplication');
import Widget = require('../../../../ui/dom/Widget');

function showFailurePoint(x:number, y:number) {
	var parentNode = document.createElement('div');
	var s = parentNode.style;
	s.color = 'red';
	s.left = x + 'px';
	s.marginTop = '-7px';
	s.paddingLeft = '7px';
	s.position = 'fixed';
	s.textShadow = '1px 1px #000';
	s.top = y + 'px';

	var node = document.createElement('div');
	s = node.style;
	s.position = 'absolute';
	s.border = '1px solid red';
	s.height = '1px';
	s.left = '0';
	s.top = '7px';
	s.width = '1px';

	parentNode.appendChild(node);
	parentNode.appendChild(document.createTextNode('FAIL'));
	document.body.appendChild(parentNode);
}

class MNW extends MultiNodeWidget {
	_render() {
		super._render();
		var lastNode = this.get('lastNode');
		lastNode.parentNode.insertBefore(document.createTextNode('⬚'), lastNode);
	}
}

class SNW extends SingleNodeWidget {
	_render() {
		var node = document.createElement('div');
		node.style.width = '30px';
		node.style.height = '30px';
		node.style.backgroundColor = '#0f0';
		this._node = node;
	}
}

class SNWContainer extends SingleNodeWidget {
	_render() {
		var node = document.createElement('div');
		node.style.height = '30px';
		node.style.backgroundColor = '#0ff';
		this._node = node;

		node.innerHTML = '⬚<span>⬚</span>⬚';
	}

	add(widget:Widget) {
		this._node.appendChild(widget.detach());
		widget.set({
			parent: this
		});
		this._node.appendChild(document.createTextNode('⬚'));
	}
}

var app:WebApplication;
var rootNode:HTMLDivElement;

registerSuite({
	name: 'mayhem/ui/dom/util',

	setup() {
		if (!has('host-browser')) {
			return;
		}

		rootNode = document.createElement('div');
		rootNode.style.position = 'fixed';
		rootNode.style.top = '0';
		rootNode.style.left = '0';
		rootNode.style.border = '1px solid green';
		rootNode.style.fontSize = '15px';
		rootNode.style.lineHeight = '1';
		rootNode.style.fontFamily = 'Arial, sans-serif';
		document.body.appendChild(rootNode);

		app = new WebApplication({
			components: {
				router: null,
				ui: {
					view: null,
					root: rootNode
				}
			}
		});

		return app.run();
	},

	teardown() {
		if (!has('host-browser')) {
			return;
		}

		app.destroy();
	},

	'basic tests'() {
		if (!has('host-browser')) {
			this.skip('DOM-only test');
		}

		var container = new Container({ app, id: 'container' });
		var childA = new MNW({ app, id: 'a' });
		var childB = new SNW({ app, id: 'b' });
		var childC = new Container({ app, id: 'c' });
		var childD = new MNW({ app, id: 'd' });
		var childE = new MNW({ app, id: 'e' });
		var childF = new SNWContainer({ app, id: 'f' });
		var childG = new MNW({ app, id: 'g' });

		childC.add(childD);
		childC.add(childE);

		childF.add(childG);

		container.add(childA);
		container.add(childB);
		container.add(childC);
		container.add(childF);

		var master = <DomMaster> app.get('ui');

		master.set('view', container);

		function testPoint(x:number, y:number, child:Widget, message:string) {
			try {
				assert.strictEqual(domUtil.findWidgetAt(master, x, y), child, message);
			}
			catch (error) {
				showFailurePoint(x, y);
				throw error;
			}
		}

		testPoint(5, 5, childA, 'Child A');
		testPoint(5, 20, childB, 'Child B');
		testPoint(5, 50, childD, 'Child D');
		testPoint(20, 50, childE, 'Child E');
		testPoint(5, 65, childF, 'Child F');
		testPoint(20, 65, childF, 'Child F inner element');
		testPoint(35, 65, childF, 'Child F pre');
		testPoint(50, 65, childG, 'Child G');
		testPoint(65, 65, childF, 'Child F post G');
		testPoint(500, 500, null, 'None of our children');
	}
});
