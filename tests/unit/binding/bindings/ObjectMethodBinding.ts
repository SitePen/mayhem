/// <reference path="../../../intern" />

import assert = require('intern/chai!assert');
import Binder = require('../../../../binding/Binder');
import bindingInterface = require('../../../../binding/interfaces');
import has = require('../../../../has');
import ObjectMethodBinding = require('../../../../binding/bindings/ObjectMethodBinding');
import registerSuite = require('intern!object');

var binder:Binder;

registerSuite({
	name: 'mayhem/binding/bindings/ObjectMethodBinding',

	before() {
		var defaultConstructors:string[] = [
			require.toAbsMid('../../../../binding/bindings/CompositeBinding'),
			require.toAbsMid('../../../../binding/bindings/NestedBinding'),
			require.toAbsMid('../../../../binding/bindings/ObjectMethodBinding'),
			require.toAbsMid('../../../../binding/bindings/ObservableBinding'),
			require.toAbsMid('../../../../binding/bindings/StatefulBinding'),
			require.toAbsMid('../../../../binding/bindings/CollectionLengthBinding'),
			require.toAbsMid('../../../../binding/bindings/ArrayBinding'),
			require.toAbsMid('../../../../binding/bindings/DomInputBinding')
		];

		if (has('es7-object-observe')) {
			defaultConstructors.push(require.toAbsMid('../../../../binding/bindings/Es7Binding'));
		}
		else {
			defaultConstructors.push(
				require.toAbsMid('../../../../binding/bindings/Es5Binding'),
				require.toAbsMid('../../../../binding/bindings/ObjectTargetBinding')
			);
		}

		binder = new Binder({
			constructors: defaultConstructors
		});

		return binder.run();
	},

	after() {
		binder = null;
	},

	test() {
		var model = {
			getData(args:any):string {
				return args.color;
			},
			app: {
				color: 'red'
			}
		};
		var binding = new ObjectMethodBinding({
			// model is the root object
			// everything else referenced has to exist on model
			// so for below examples, mode.getData, model.app, model.method, model.thing
			object: model,
			path: 'getData({ color: app.color })',
			/*
			path: 'method(literalValue)'
			path: 'thing.method(literalValue)'
			path: 'thing.method(thing2.thing3.property)'
			path: 'thing.method({ p1: thing2.property, p2: thing2.thing3.property })'
			*/
			binder: binder
		});
		model.app.color = 'blue';
	}
});
