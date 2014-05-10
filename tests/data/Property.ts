/// <reference path="../../dojo"/>
/// <reference path="../intern"/>

import core = require('../../interfaces');
import assert = require('intern/chai!assert');
import registerSuite = require('intern!object');
import data = require('../../data/interfaces');
import Property = require('../../data/Property');
import Deferred = require('dojo/Deferred');

var validator:core.IValidator;
var errorValidator:core.IValidator;
registerSuite({
	name: 'Property',

	'#set and #get': function () {
		var p1 = new Property<string>({
			value: 'foo',
			doWork: function () {}
		});

		var p2 = new Property<number>();
		p2.set('value', 1234);

		assert.strictEqual(p1.get('value'), 'foo');
		assert.strictEqual(p2.get('value'), 1234);

		assert.isFalse('doWork' in p1.get());
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
			errorValidator = {
				validate: function (model:any, key:string, value:any):any {
					var dfd:IDeferred<void> = new Deferred<void>();
					setTimeout(function ():void {
						dfd.reject(new Error('BOOM'));
					}, 0);
					return dfd.promise;
				}
			}
		},
		
		'observe errors': function () {
			var dfd = this.async(1000);
			var property = new Property<string>({
				value: 'foo',
				validators: [ errorValidator ]
			});

			property.observe('errors', dfd.callback(function () {
				assert.isTrue(true);
			}));
			
			property.validate();
		
		},

		'errors': function () {
			var dfd = this.async(1000);
			var property = new Property<string>({
				value: 'foo',
				validators: [ errorValidator ]
			});
			
			property.validate().then(function () {}, dfd.callback(function (error:any) {
				assert.equal(error.message, 'BOOM');
			}));
		
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
		},

		'empty validator': function () {
			var dfd = this.async(1000);
			var property = new Property<string>({
				value: '',
				validators: [ validator, validator]
			});

			validator.options = {allowEmpty: true};

			property.validate().then(dfd.callback(function (noErrors:boolean) {
				assert.isTrue(noErrors);
			}));
		
		}
	}
});
