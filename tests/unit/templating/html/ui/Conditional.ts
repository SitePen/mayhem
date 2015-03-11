import assert = require('intern/chai!assert');
import Conditional = require('mayhem/templating/html/ui/Conditional');
import MockWebApplication = require('../../../../support/MockWebApplication');
import registerSuite = require('intern!object');
import SingleNodeWidget = require('mayhem/ui/dom/SingleNodeWidget');

var app:MockWebApplication;
var root:HTMLDivElement;

class View extends SingleNodeWidget {
	_render() {
		this._node = document.createElement('span');
	}
}

class InheritingView extends View {
	static inheritsModel:boolean = true;
}

registerSuite({
	name: 'templating/html/ui/Conditional',

	beforeEach() {
		root = document.createElement('div');
		document.body.appendChild(root);
		app = new MockWebApplication({
			components: {
				ui: {
					root: root
				}
			}
		});
		return app.run();
	},

	afterEach() {
		app.destroy();
		root.parentNode.removeChild(root);
		app = root = null;
	},

	inheritedModel() {
		var model = {};
		var nonInheritingView = new View({ app });
		var inheritingView = new InheritingView({ app });
		var conditional = new Conditional({
			app,
			model,
			conditions: [
				{ condition: true, consequent: nonInheritingView }
			]
		});

		app.get('ui').set('view', conditional);
		assert.notStrictEqual(nonInheritingView.get('model'), model);

		assert.isUndefined(inheritingView.get('model'));
		conditional.set('conditions', [ { condition: true, consequent: inheritingView } ]);
		assert.strictEqual(inheritingView.get('model'), model);
	}
});
