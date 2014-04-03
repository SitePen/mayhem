/// <reference path="../intern" />

import assert = require('intern/chai!assert');
import registerSuite = require('intern!object');
import Conditional = require('../../ui/Conditional');
import aspect = require('dojo/aspect');
import Widget = require('../mocks/ui/Widget');
import MockApplication = require('../mocks/Application');

var conditional:Conditional,
	replacedMethods:any;

registerSuite({
	name: 'ui/Conditional',

	beforeEach() {
		conditional = new Conditional();
	},

	afterEach() {
		if (conditional) {
			try {
				conditional.destroy();
			} catch (e) {
				// ignore
			}
			conditional = null;
		}

		if (replacedMethods) {
			for (var key in replacedMethods) {
				Conditional.prototype[key] = replacedMethods[key];
			}
			replacedMethods = null;
		}
	},

	'#add': function () {
		var widget:any = new Widget(),
			consequent = conditional.get('consequent'),
			addedWidget:any;

		aspect.before(consequent, 'add', function (widget:any) {
			addedWidget = widget;
		});

		conditional.add(widget);
		assert.strictEqual(addedWidget, widget, 'Widget should have been added to consequent');
	},

	'#setContent': function () {
		var widget = new Widget(),
			consequent:any = conditional.get('consequent');
		aspect.before(consequent, 'set', function (key:string, value:any) {

		});
		conditional.setContent(widget);
		assert.propertyVal(consequent._renderer._content, consequent.get('id'), widget,
			'Consequent content should be widget');
	},

	'alternate observer': function () {
		var placed = false,
			conditionalPlaceView = Conditional.prototype['_placeView'];
		replacedMethods = { '_placeView': conditionalPlaceView };
		Conditional.prototype['_placeView'] = function () {
			placed = true;
			conditionalPlaceView.apply(this, arguments);
		}
		conditional = new Conditional();
		conditional.set('alternate', new Widget());
		assert.isTrue(placed, 'Widget should have been placed');
	},

	'consequent observer': function () {
		var placed = false,
			conditionalPlaceView = Conditional.prototype['_placeView'];
		replacedMethods = { '_placeView': conditionalPlaceView };
		Conditional.prototype['_placeView'] = function () {
			placed = true;
			conditionalPlaceView.apply(this, arguments);
		}
		conditional = new Conditional();
		conditional.set('consequent', new Widget());
		assert.isTrue(placed, 'Widget should have been placed');
	},

	'condition observer': function () {
		var sourceBinding:any;
		aspect.before(conditional, 'bind', function (kwArgs:any) {
			sourceBinding = kwArgs.sourceBinding;
		});

		conditional.set('condition', 'foo');
		assert.strictEqual(sourceBinding, 'foo', 'Binding should have been created for foo');
	},

	'result observer': function () {
		var consequentVisible = false,
			alternateVisible = false,
			alternate = new Widget();
		aspect.before(conditional.get('consequent'), 'set', function (key:string, value:any) {
			if (key === 'visible') {
				consequentVisible = true;
			}
		});
		aspect.before(alternate, 'set', function (key:string, value:any) {
			if (key === 'visible') {
				alternateVisible = true;
			}
		});
		conditional.set('alternate', alternate);
		conditional.set('result', 'foo');
		assert.isDefined(consequentVisible, 'Consequent visibility should have been set');
		assert.isDefined(alternateVisible, 'Alternate visibility should have been set');
	}
});
