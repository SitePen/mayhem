/// <reference path="../../intern" />

import assert = require('intern/chai!assert');
import binding = require('../../../binding/interfaces');
import NodeTargetProxty = require('../../../binding/proxties/NodeTargetProxty');
import MockProxty = require('../support/MockProxty');
import bdd = require('intern!bdd');
import has = require('dojo/has');

bdd.describe('binding/proxties/NodeTargetProxty', function () {
    bdd.describe('.test', function () {
        if(has('host-browser')) {
            bdd.it('should be able to bind a node', function () {
                var element = document.createElement('div'),
                    result = NodeTargetProxty.test({
                        object: element,
                        binding: '',
                        binder: null
                    });

                assert.isTrue(result, 'Should be able to bind a node');
            });
        }
        bdd.it('should not be able to bind a non-node', function () {
            var result = NodeTargetProxty.test({
                object: {},
                binding: '',
                binder: null
            });

            assert.isFalse(result, 'Should not be able to bind a non-node');
        });
    });

    if(has('host-browser')) {
        bdd.describe('basic tests', function () {
            var sourceObject = document.createElement('div'), source, target;

            sourceObject.id = '1';

            source = new NodeTargetProxty({
                object: sourceObject,
                binding: 'id',
                binder: null
            });

            target = new MockProxty({
                object: {},
                binding: 'foo',
                binder: null
            });

            assert.strictEqual(source.get(), sourceObject.id, 'Bound source property should match value of source property object');

            var handle = source.bindTo(target);
            assert.strictEqual(target.get(), source.get(), 'Target value should match bound source value');

            sourceObject.id = '2';
            assert.strictEqual(source.get(), '2', 'Bound source property should show current value of source');

            source.set('4');
            assert.strictEqual(sourceObject.id, '4', 'Bound source property should change when source is updated');

            handle.remove();
            sourceObject.id = '5';
            assert.strictEqual(source.get(), '5', 'Bound source property should match value of source property object even when target is removed');

            assert.doesNotThrow(function () {
                handle.remove();
            }, 'Removing handle a second time should be a no-op');

            sourceObject.id = '6';
            handle = source.bindTo(target);
            assert.strictEqual(target.get(), '6', 'Re-binding to target should reset target value');
            handle.remove();

            sourceObject.id = '7';
            source.bindTo(target, { setValue: false });
            assert.strictEqual(target.get(), '6', 'Re-binding to target with setValue=false should not reset target value');

            source.bindTo(null);
            sourceObject.id = '8';
            assert.strictEqual(target.get(), '6', 'Removing binding should stop old target property from updating');

            source.destroy();
            sourceObject.id = '7';
            assert.isUndefined(source.get(), 'Destroyed source property should no longer have a value from the source property object');

            assert.doesNotThrow(function () {
                source.destroy();
            }, 'Destroying property a second time should be a no-op');

            assert.doesNotThrow(function () {
                source.set('8');
            }, 'Setting the value of a destroyed proxty should be a no-op');
        });
    }
});