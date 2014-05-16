/// <reference path="../../dojo" />
/// <reference path="../intern" />

import assert = require('intern/chai!assert');
import Model = require('../../data/Mediator');
import Mediator = require('../../data/Mediator');
import registerSuite = require('intern!object');
import Stateful = require('dojo/Stateful');

class TestModel extends Model {}
TestModel.schema(():any => {
	return {
		firstName: Model.property<string>({
			label: 'First name',
			/*validators: [ {
				validate: function (model:TestModel, key:string, value:string):void {
					if (value !== 'Joe') {
						model.addError(key, new ValidationError('You must be Joe!'));
					}
				}
			} ],*/
			value: 'default-first-name'
		}),

		lastName: Model.property<string>({
			label: 'Last name',
			value: 'default-last-name'
		})
	};
});

class TestMediator extends Mediator {}
Mediator.schema(():any => {
	return {
		mediatorProperty: TestMediator.property<string>({
			label: 'Simple Mediator Property',
			value: 'default-simple-value'
		}),
		fullName: TestMediator.property<string>({
			label: 'Full Name',
			get():string {
				var model = this.get('model'), first = model.get('firstName'), last = model.get('lastName');
				if(first && last) {
					return first + ' ' + last;
				}
			},
			set(value:string):void {
				var names:string[] = value.split(' ');
				this.get('model').set({
					firstName: names[0],
					lastName: names.slice(1).join(' ')
				});
			},
			dependencies: [ 'firstName', 'lastName' ]
		}),
		fullyReversedName: TestMediator.property<string>({
			label: 'Fully Reversed Name',
			get():string {
				var fullName = this.get('model').get('fullName');
				return fullName && fullName.split('').reverse().join('');
			},
			set(value:string):void {
				this.get('model').set('fullName', value.split('').reverse().join(''));
			},
			dependencies: [ 'fullName' ]
		}),
		readOnlyFullName: TestMediator.property<string>({
			label: 'Read-only Full Name',
			get():string {
				return this.get('model').get('fullName');
			}
		})
	};
});

class OuterTestMediator extends Mediator {}
OuterTestMediator.schema(():any => {
	return {
		outerMediatorProperty: OuterTestMediator.property<string>({
			label: 'Outer Mediator Property',
			value: 'default-outer-value'
		})
	};
});

var model:TestModel,
	mediator:TestMediator;

registerSuite({
	name: 'Mediator',

	'construction': {
		'defaults'() {
			var mediator = new TestMediator({ model: new TestModel() });

			assert.strictEqual(mediator.get('firstName'), 'default-first-name');
			assert.strictEqual(mediator.get('lastName'), 'default-last-name');
			assert.strictEqual(mediator.get('mediatorProperty'), 'default-simple-value');
		},

		'keyword args set mediator and model properties'() {
			var model = new TestModel(),
				mediator = new TestMediator({
					model: model,

					mediatorProperty: 'expected-simple-property-value',
					firstName: 'expected-first-name',
					lastName: 'expected-last-name'
				});

			assert.strictEqual(
				mediator.get('mediatorProperty'),
				'expected-simple-property-value'
			);
			assert.isUndefined(model.get('mediatorProperty'));
			assert.strictEqual(mediator.get('firstName'), 'expected-first-name');
			assert.strictEqual(model.get('firstName'), 'expected-first-name');
			assert.strictEqual(mediator.get('lastName'), 'expected-last-name');
			assert.strictEqual(model.get('lastName'), 'expected-last-name');
		}
	},

	'simple properties': {
		beforeEach() {
			model = new TestModel({ firstName: 'Otto' });
			mediator = new TestMediator({ model: model });
		},

		'setting property on mediator when property exists on mediator does not set model property'() {
			mediator.set('mediatorProperty', 'world');

			assert.strictEqual(mediator.get('mediatorProperty'), 'world');
			assert.isUndefined(model.get('mediatorProperty'));
		},

		'delegate to `model` property for properties not defined on the mediator'() {
			assert.strictEqual(mediator.get('firstName'), 'Otto');
		},

		'isExtensible': {
			'setting `isExtensible: false` should not allow setting property not yet defined by model or mediator'() {
				mediator.set('isExtensible', false);
				mediator.set('nonMediatorProperty', 'some-value');
				assert.isUndefined(mediator.get('nonMediatorProperty'));
			},
			'setting `isExtensible: true` should allow setting property not yet defined by model or mediator'() {
				mediator.set('isExtensible', true);
				mediator.set('nonMediatorProperty', 'expected-value');
				assert.strictEqual(mediator.get('nonMediatorProperty'), 'expected-value');
				// TODO The mediator does not update the properties on the model. Discussion about 
				// the mediator - model relationship is ongoing. This test is a known failure. 
				assert.strictEqual(model.get('nonMediatorProperty'), 'expected-value');
			}
		},

		'should get property from model when it is not defined by the mediator'() {
			assert.strictEqual(mediator.get('firstName'), 'Otto');
		},

		'observe'() {
			var notifications:any[] = [];

			function notify(newValue:string, oldValue:string, key:string) {
				notifications.push({
					newValue: newValue, oldValue: oldValue, key: key
				});
			}

			mediator.observe('mediatorProperty', notify);
			mediator.observe('firstName', notify);
			mediator.observe('lastName', notify);

			mediator.set('firstName', 'expected-first-name-1');
			model.set('firstName', 'expected-first-name-2');

			mediator.set('mediatorProperty', 'expected-property-1');
			// expecting no notification because model has no mediatorProperty
			model.set('mediatorProperty', 'expected-property-2');	

			mediator.set('lastName', 'expected-last-name-1');
			model.set('lastName', 'expected-last-name-2');

			assert.deepEqual(notifications, [
				{ newValue: 'expected-first-name-1', oldValue: 'Otto', key: 'firstName' },
				{ newValue: 'expected-first-name-2', oldValue: 'expected-first-name-1', key: 'firstName' },
				{ newValue: 'expected-property-1', oldValue: 'default-simple-value', key: 'mediatorProperty' },
				{ newValue: 'expected-last-name-1', oldValue: 'default-last-name', key: 'lastName' },
				{ newValue: 'expected-last-name-2', oldValue: 'expected-last-name-1', key: 'lastName' },
			]);
		},

		'model should be nullable'() {
			mediator.set('model', null);
			assert.isNull(mediator.get('model'));

			mediator.set('firstName', 'Bryan');
			assert.isUndefined(
				mediator.get('firstName'),
				'Non-mediator property should not be defined when model is null'
			);
		}
	},

	'computed properties': {
		beforeEach() {
			model = new TestModel({ firstName: 'First', lastName: 'Last' });
			mediator = new TestMediator({ model: model });
		},

		// test get and set computed property dependent on model
		'with model property dependencies'() {
			assert.strictEqual(mediator.get('fullName'), 'First Last');
			mediator.set('fullName', 'John Doe');
			assert.strictEqual(mediator.get('fullName'), 'John Doe');
			assert.strictEqual(mediator.get('firstName'), 'John');
			assert.strictEqual(mediator.get('lastName'), 'Doe');
			assert.strictEqual(model.get('firstName'), 'John');
			assert.strictEqual(model.get('lastName'), 'Doe');
		},

		'with computed property dependency'() {
			assert.strictEqual(mediator.get('fullyReversedName'), 'tsaL tsriF');
			mediator.set('fullyReversedName', 'eoD enaJ');
			assert.strictEqual(mediator.get('fullyReversedName'), 'eoD enaJ');
			assert.strictEqual(mediator.get('fullName'), 'Jane Doe');
		},

		'computed property without setter is read-only'() {
			assert.strictEqual(mediator.get('readOnlyFullName'), 'First Last');
			mediator.set('readOnlyFullName', 'Foo Bar');
			assert.strictEqual(mediator.get('readOnlyFullName'), 'First Last');
			assert.strictEqual(mediator.get('firstName'), 'First');
			assert.strictEqual(mediator.get('lastName'), 'Last');
		},

		'observe'() {
			var notifications:any[] = [];

			function notify(newValue:string, oldValue:string, key:string) {
				notifications.push({
					newValue: newValue, oldValue: oldValue, key: key
				});
			}
			
			mediator.observe('firstName', notify);
			mediator.observe('lastName', notify);
			mediator.observe('fullName', notify);
			mediator.observe('fullyReversedName', notify);

			mediator.set('fullyReversedName', 'zaB raB ooF');

			// sort notifications because the order in which dependencies are set is uncertain
			notifications.sort((a, b) => {
				a = a.key;
				b = b.key;
				return (a < b ? -1 : (a === b ? 0 : 1));
			});
			// TODO It is still not clear if the mediator should update properties on the model. 
			// This test fails because of extra notifications from dependent properties publishing 
			// update events. Once we decide how the mediator should manage the model, we can then 
			// identify how dependency between properties should trigger change events. 
			assert.deepEqual(notifications, [
				{ key: 'firstName', newValue: 'Foo', oldValue: 'First' },
				{ key: 'fullName', newValue: 'Foo Bar Baz', oldValue: 'First Last' },
				{ key: 'fullyReversedName', newValue: 'zaB raB ooF', oldValue: 'tsaL tsriF' },
				{ key: 'lastName', newValue: 'Bar Baz', oldValue: 'Last' }
			]);
		},

		'model should be nullable'() {
			mediator.set('model', null);
			assert.isNull(mediator.get('model'));

			assert.isUndefined(mediator.get('fullName'));
			mediator.set('fullName', 'Mark Twain');
			assert.isUndefined(mediator.get('fullName'));
		}
	},

	'nesting Mediators'() {
		var model = new TestModel(),
			innerMediator = new TestMediator({ model: model }),
			outerMediator = new OuterTestMediator({
				model: innerMediator,

				outerMediatorProperty: 'expected-outer-value',
				mediatorProperty: 'expected-property-value',
				firstName: 'Mark',
				lastName: 'Twain'
			});

		assert.strictEqual(outerMediator.get('outerMediatorProperty'), 'expected-outer-value');

		assert.strictEqual(outerMediator.get('mediatorProperty'), 'expected-property-value');
		assert.strictEqual(innerMediator.get('mediatorProperty'), 'expected-property-value');

		assert.strictEqual(outerMediator.get('firstName'), 'Mark');
		assert.strictEqual(innerMediator.get('firstName'), 'Mark');
		assert.strictEqual(model.get('firstName'), 'Mark');

		assert.strictEqual(outerMediator.get('lastName'), 'Twain');
		assert.strictEqual(innerMediator.get('lastName'), 'Twain');
		assert.strictEqual(model.get('lastName'), 'Twain');

		outerMediator.set('lastName', 'Hamill');
		assert.strictEqual(outerMediator.get('lastName'), 'Hamill');
		assert.strictEqual(innerMediator.get('lastName'), 'Hamill');
		assert.strictEqual(model.get('lastName'), 'Hamill');
		assert.strictEqual(outerMediator.get('fullName'), 'Mark Hamill');
	}

	// TODO: Test validation
	// TODO: Test metadata access
});
