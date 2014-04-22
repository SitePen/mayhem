/// <reference path="../../dojo"/>
/// <reference path="../intern"/>

import core = require('../../interfaces');
import assert = require('intern/chai!assert');
import registerSuite = require('intern!object');
import data = require('../../data/interfaces');
import Property = require('../../data/Property');

var validator:core.IValidator;
registerSuite({
	name: 'Property',

	'#set and #get': function () {
		var p1 = new Property<string>({
			value: 'foo'
		});

		var p2 = new Property<number>();
		p2.set('value', 1234);

		assert.strictEqual(p1.get('value'), 'foo');
		assert.strictEqual(p2.get('value'), 1234);
	},

	'#valueOf': function () {
		var p1 = new Property<boolean>({
			value: true
		});

		var p2 = new Property<boolean>({
			value: false
		});

		assert.isTrue(p1.valueOf());
		assert.isFalse(p2.valueOf());
	},

	'#observe': function () {
		var dfd = this.async(1000);
		var property = new Property<string>({
			value: 'foo'
		});

		var changedValue:string = 'bar';
		var handle = property.observe('value', dfd.callback(function (newValue:string, oldValue:string, key:string) {
			assert.strictEqual(newValue, changedValue);
			handle.remove();
		}));

		property.set('value', changedValue);
	},

	'#validate': {
		beforeEach: function () {
			validator = {
				validate: function (model:any, key:string, value:any):void {
				}
			};
		},

		'no errors': function () {
			var dfd = this.async(1000);
			var property = new Property<string>({
				value: 'foo',
				validators: [ validator ]
			});

			property.validate().then(dfd.callback(function (noErrors:boolean) {
				assert.isTrue(noErrors);
			}));
		}
	}
});
