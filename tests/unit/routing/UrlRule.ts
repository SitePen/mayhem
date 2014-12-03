/// <reference path="../../../dojo" />
/// <reference path="../../intern" />

import assert = require('intern/chai!assert');
import lang = require('dojo/_base/lang');
import Request = require('../../../routing/Request');
import UrlRule = require('../../../routing/UrlRule');
import registerSuite = require('intern!object');

function createRequest(overrides?:{}) {
	return new Request(lang.mixin({
		protocol: 'http:',
		method: 'GET',
		host: 'www.example.com',
		path: '/items/1',
		vars: {
			foo: 'foo',
			bar: [ 'bar1', 'bar2' ]
		}
	}, overrides));
}

registerSuite({
	name: 'mayhem/routing/UrlRule',

	'empty rule'() {
		var routeInfo = {
			routeId: 'foo',
			kwArgs: {}
		};

		var request = new Request({
			protocol: 'http:',
			method: 'GET',
			host: 'www.example.com',
			path: '',
			vars: {
				routeId: 'foo'
			}
		});

		var rule = new UrlRule();

		assert.deepEqual(rule.parse(request), routeInfo);

		request.vars = {};
		assert.isNull(rule.parse(request));

		assert.deepEqual(rule.serialize(routeInfo.routeId), '?routeId=foo');
	},

	'#path'() {
		var routeInfo = {
			routeId: 'items',
			kwArgs: {
				id: 1,
				foo: 'foo',
				bar: [ 'bar1', 'bar2' ]
			}
		};
		var request = createRequest();
		var rule = new UrlRule({
			path: '<routeId:\\w+>/<id:\\d+>'
		});
		assert.deepEqual(rule.parse(request), routeInfo);
		assert.deepEqual(rule.serialize(routeInfo.routeId, routeInfo.kwArgs), '/items/1?foo=foo&bar=bar1&bar=bar2');
	},

	'#defaults'() {
		var routeInfo = {
			routeId: 'foo',
			kwArgs: {
				id: 1,
				foo: 'foo',
				bar: [ 'bar1', 'bar2' ]
			}
		};
		var request = createRequest();
		var rule = new UrlRule({
			routeId: 'foo',
			defaults: {
				id: 1
			}
		});
		assert.deepEqual(rule.parse(request), routeInfo);
		assert.isNull(rule.serialize('non-matching', {}), 'If a routeId is provided by the rule, the rule should not match unless the passed routeId exists and matches');
		assert.deepEqual(rule.serialize('foo', {}), '?id=1');
	},

	'#protocol'() {
		var routeInfo = {
			routeId: 'foo',
			kwArgs: {
				id: 1,
				foo: 'foo',
				bar: [ 'bar1', 'bar2' ]
			}
		};

		var request = createRequest();
		var rule = new UrlRule({
			routeId: 'foo',
			protocol: 'https:',
			host: 'www.example.com',
			defaults: {
				id: 1
			}
		});

		assert.deepEqual(rule.parse(request), null);

		request = createRequest({ protocol: 'https:' });
		assert.deepEqual(rule.parse(request), routeInfo);
		assert.deepEqual(rule.serialize(routeInfo.routeId, routeInfo.kwArgs), 'https://www.example.com/?id=1&foo=foo&bar=bar1&bar=bar2');
	},

	'#methods'() {
		var routeInfo = {
			routeId: 'foo',
			kwArgs: {}
		};
		var request = createRequest({
			vars: {
				routeId: 'foo'
			}
		});
		var rule = new UrlRule({
			methods: [ 'GET', 'POST' ]
		});
		assert.deepEqual(rule.parse(request), routeInfo);
		assert.deepEqual(rule.serialize(routeInfo.routeId, routeInfo.kwArgs), '?routeId=foo');

		rule = new UrlRule({
			methods: [ 'POST' ]
		});

		assert.isNull(rule.parse(request));

		request = createRequest({ method: 'POST', vars: { routeId: 'foo' } });
		assert.deepEqual(rule.parse(request), routeInfo);
	},

	'#host'() {
		var routeInfo = {
			routeId: 'foo',
			kwArgs: {
				subdomain: 'www',
				foo: 'foo',
				bar: [ 'bar1', 'bar2' ]
			}
		};
		var request = createRequest();
		var rule = new UrlRule({
			routeId: 'foo',
			host: '<subdomain:\\w+>.example.com'
		});
		assert.deepEqual(rule.parse(request), routeInfo);
		assert.deepEqual(rule.serialize(routeInfo.routeId, routeInfo.kwArgs), '//www.example.com/?foo=foo&bar=bar1&bar=bar2');
	},

	'#host + #path'() {
		var routeInfo = {
			routeId: 'items',
			kwArgs: {
				subdomain: 'www',
				id: 1,
				foo: 'foo',
				bar: [ 'bar1', 'bar2' ]
			}
		};
		var request = createRequest();
		var rule = new UrlRule({
			host: '<subdomain:\\w+>.example.com',
			path: '<routeId:\\w+>/<id:\\d+>'
		});
		assert.deepEqual(rule.parse(request), routeInfo);
		assert.deepEqual(rule.serialize(routeInfo.routeId, routeInfo.kwArgs), '//www.example.com/items/1?foo=foo&bar=bar1&bar=bar2');
	},

	'optional #host + #path parameters'() {
		var request = createRequest({ host: 'example.com' });
		var rule = new UrlRule({
			host: '<subdomain:\\w+>.example.com',
			path: '<routeId:\\w+>/<id:\\d+>/<action:\\w+>',
			defaults: {
				subdomain: 'www',
				action: 'list'
			}
		});
		assert.deepEqual(rule.parse(request), {
			routeId: 'items',
			kwArgs: {
				subdomain: 'www',
				id: 1,
				action: 'list',
				foo: 'foo',
				bar: [ 'bar1', 'bar2' ]
			}
		});
		assert.deepEqual(rule.serialize('foo', { id: 1 }), '//www.example.com/foo/1/list');
	}
});
