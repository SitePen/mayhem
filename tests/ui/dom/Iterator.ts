/// <reference path="../../../dojo" />
/// <reference path="../../intern" />

import assert = require('intern/chai!assert');
import aspect = require('dojo/aspect');
import Iterator = require('../../../ui/Iterator');
import Memory = require('dojo/store/Memory');
import Observable = require('../../../Observable');
import ObservableArray = require('../../../ObservableArray');
import registerSuite = require('intern!object');
import ui = require('../../../ui/interfaces');
import util = require('../support/util');
import Widget = require('../../mocks/ui/Widget');
import WidgetFactory = require('../../../templating/WidgetFactory');

var iterator:any,
	renderer:any;

registerSuite({
	name: 'ui/dom/Iterator',

	beforeEach():void {
		iterator = new Iterator();
		renderer = iterator._renderer;
	},

	afterEach():void {
		iterator = util.destroy(iterator);
	},

	'#initialize': function ():void {
		var calls:any = {},
			destroyCalled:boolean = false,
			selectedItemCalled:boolean = false;

		iterator._impl = {
			set: function (key:string, value:any):any {
				calls[key] = true;
			},
			destroy: function ():void {
				destroyCalled = true;
			}
		};

		iterator.on('selection', function ():void {
			selectedItemCalled = true;
		});

		renderer.initialize(iterator);
		iterator.set('selectedItem', null);
		iterator.set('allowSelectAll', true);
		iterator.set('allowTextSelection', true);
		iterator.set('source', null);

		assert.isTrue(selectedItemCalled);
		assert.property(calls, 'allowSelectAll');
		assert.property(calls, 'allowTextSelection');
		assert.isTrue(destroyCalled);
	},

	'#destroy'():void {
		var destroyed = false,
			widget:any = {
				_impl: { destroy():void { destroyed = true; } }
			};
		assert.doesNotThrow(function ():void {
			renderer.destroy(widget);
		}, 'Destroying renderer should not throw');
		assert.isTrue(destroyed, 'Widget should have been destroyed');
		assert.isNull(widget._impl, 'Widget list implementation should be null');
	}
});
