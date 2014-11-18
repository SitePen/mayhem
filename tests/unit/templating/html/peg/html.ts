/// <reference path="../../../../intern" />

import assert = require('intern/chai!assert');
import parser = require('../../../../../templating/html/peg/html');
import registerSuite = require('intern!object');
import templating = require('../../../../../templating/interfaces');

var prefix = (function (prefix:string) {
	prefix = prefix ? prefix + '/' : '';
	return function (mid:string):string {
		return prefix + mid;
	};
})(require.toAbsMid('../../../../../'));

registerSuite({
	name: 'templating/html/peg/html',

	'Template (empty)'() {
		var ast = parser.parse('');
		assert.deepEqual(ast, {
			constructors: [ prefix('templating/html/ui/Element') ],
			root: {
				constructor: prefix('templating/html/ui/Element'),
				content: [],
				children: []
			}
		});
	},

	'Widget'() {
		var ast = parser.parse('<widget is="Widget"></widget>');
		assert.deepEqual(ast, {
			constructors: [ 'Widget' ],
			root: { constructor: 'Widget' }
		});

		assert.throws(function () {
			parser.parse('<widget missing-constructor></widget>');
		}, /Missing required attribute "is"/);

		assert.throws(function () {
			parser.parse('<widget is></widget>');
		}, /must be a string/);
	},

	'Widget self-close'() {
		var ast:templating.IParseTree;

		ast = parser.parse('<widget is="Widget" />');
		assert.deepEqual(ast, {
			constructors: [ 'Widget' ],
			root: { constructor: 'Widget' }
		});

		ast = parser.parse('<widget is="Widget"/>');
		assert.deepEqual(ast, {
			constructors: [ 'Widget' ],
			root: { constructor: 'Widget' }
		});

		ast = parser.parse('<widget is="Parent"><widget is="Child"/></widget>');
		assert.deepEqual(ast, {
			constructors: [ 'Parent', 'Child' ],
			root: {
				constructor: 'Parent',
				children: [
					{ constructor: 'Child' }
				]
			}
		});
	},

	'AttributeMap'() {
		var ast:templating.IParseTree;

		ast = parser.parse('<widget is="Widget" is-a="\'a\'" is-2="2" is-boolean />');
		assert.deepEqual(ast, {
			constructors: [ 'Widget' ],
			root: {
				constructor: 'Widget',
				isA: '\'a\'',
				is2: '2',
				isBoolean: true
			}
		});

		ast = parser.parse('<widget is=\'Widget\' is-a=\'"a"\' is-2=\'2\' is-boolean />');
		assert.deepEqual(ast, {
			constructors: [ 'Widget' ],
			root: {
				constructor: 'Widget',
				isA: '"a"',
				is2: '2',
				isBoolean: true
			}
		});
	},

	'AttributeMap duplicate'() {
		assert.throws(function () {
			parser.parse('<widget is="Widget" a="a" a="b" />');
		}, /duplicate attribute "a"/i);

		assert.throws(function () {
			parser.parse('<alias tag="foo" to="Foo"><foo a="a" a="b" />');
		}, /duplicate attribute "a"/i);
	},

	'AliasedWidget'() {
		var ast = parser.parse('<alias tag="foo" to="Foo"><foo></foo>');
		assert.deepEqual(ast, {
			constructors: [ 'Foo' ],
			root: { constructor: 'Foo' }
		});
	},

	'AliasedWidget self-close'() {
		var ast:templating.IParseTree;

		ast = parser.parse('<alias tag="foo" to="Widget"><foo />');
		assert.deepEqual(ast, {
			constructors: [ 'Widget' ],
			root: { constructor: 'Widget' }
		});

		ast = parser.parse('<alias tag="foo" to="Widget"><foo/>');
		assert.deepEqual(ast, {
			constructors: [ 'Widget' ],
			root: { constructor: 'Widget' }
		});

		ast = parser.parse('<alias tag="foo" to="Widget"><foo><foo index="0"></foo><foo index="1" /><foo index="2"/></foo>');
		assert.deepEqual(ast, {
			constructors: [ 'Widget' ],
			root: {
				constructor: 'Widget',
				children: [
					{ constructor: 'Widget', index: '0' },
					{ constructor: 'Widget', index: '1' },
					{ constructor: 'Widget', index: '2' }
				]
			}
		});
	},

	'doubled Alias'() {
		assert.throws(function () {
			parser.parse('<alias tag="a" to="A"><alias tag="a" to="B">');
		}, /was already defined/);
	},

	'InvalidAlias'() {
		assert.throws(function () {
			parser.parse('<widget is="Early"></widget><alias tag="too-late" to="TooLate">');
		}, /can only be defined at the beginning of the template/);
	},

	'If'() {
		var ast = parser.parse('<if condition={foo}><widget is="success"></widget></if>');
		assert.deepEqual(ast, {
			constructors: [ prefix('templating/html/ui/Conditional'), 'success' ],
			root: {
				constructor: prefix('templating/html/ui/Conditional'),
				conditions: [
					{
						condition: { $bind: 'foo', direction: 1 },
						consequent: { constructor: 'success' }
					}
				]
			}
		});
	},

	'If Else'() {
		var ast = parser.parse('<if condition={foo}><widget is="success"></widget><else><widget is="else"></widget></if>');
		assert.deepEqual(ast, {
			constructors: [ prefix('templating/html/ui/Conditional'), 'success', 'else' ],
			root: {
				constructor: prefix('templating/html/ui/Conditional'),
				conditions: [
					{
						condition: { $bind: 'foo', direction: 1 },
						consequent: { constructor: 'success' }
					},
					{
						condition: true,
						consequent: { constructor: 'else' }
					}
				]
			}
		});
	},

	'If Elseif'() {
		var ast:templating.IParseTree;

		ast = parser.parse('<if condition={foo}><widget is="success"></widget><elseif condition={bar}><widget is="else"></widget></if>');
		assert.deepEqual(ast, {
			constructors: [ prefix('templating/html/ui/Conditional'), 'success', 'else' ],
			root: {
				constructor: prefix('templating/html/ui/Conditional'),
				conditions: [
					{
						condition: { $bind: 'foo', direction: 1 },
						consequent: { constructor: 'success' }
					},
					{
						condition: { $bind: 'bar', direction: 1 },
						consequent: { constructor: 'else' }
					}
				]
			}
		});

		ast = parser.parse('<if condition={foo}><widget is="success"></widget><elseif condition={bar}><widget is="else"></widget><elseif condition={baz}><widget is="else2"></widget></if>');
		assert.deepEqual(ast, {
			constructors: [ prefix('templating/html/ui/Conditional'), 'success', 'else', 'else2' ],
			root: {
				constructor: prefix('templating/html/ui/Conditional'),
				conditions: [
					{
						condition: { $bind: 'foo', direction: 1 },
						consequent: { constructor: 'success' }
					},
					{
						condition: { $bind: 'bar', direction: 1 },
						consequent: { constructor: 'else' }
					},
					{
						condition: { $bind: 'baz', direction: 1 },
						consequent: { constructor: 'else2' }
					}
				]
			}
		});
	},

	'If Elseif Else'() {
		var ast:templating.IParseTree;

		ast = parser.parse(
			'<if condition={foo}><widget is="success"></widget>' +
			'<elseif condition={bar}><widget is="else"></widget>' +
			'<else><widget is="else2"></widget></if>'
		);
		assert.deepEqual(ast, {
			constructors: [ prefix('templating/html/ui/Conditional'), 'success', 'else', 'else2' ],
			root: {
				constructor: prefix('templating/html/ui/Conditional'),
				conditions: [
					{
						condition: { $bind: 'foo', direction: 1 },
						consequent: { constructor: 'success' }
					},
					{
						condition: { $bind: 'bar', direction: 1 },
						consequent: { constructor: 'else' }
					},
					{
						condition: true,
						consequent: { constructor: 'else2' }
					}
				]
			}
		});

		ast = parser.parse(
			'<if condition={foo}><widget is="success"></widget>' +
			'<elseif condition={bar}><widget is="else"></widget>' +
			'<elseif condition={baz}><widget is="else2"></widget>' +
			'<else><widget is="else3"></widget></if>'
		);
		assert.deepEqual(ast, {
			constructors: [ prefix('templating/html/ui/Conditional'), 'success', 'else', 'else2', 'else3' ],
			root: {
				constructor: prefix('templating/html/ui/Conditional'),
				conditions: [
					{
						condition: { $bind: 'foo', direction: 1 },
						consequent: { constructor: 'success' }
					},
					{
						condition: { $bind: 'bar', direction: 1 },
						consequent: { constructor: 'else' }
					},
					{
						condition: { $bind: 'baz', direction: 1 },
						consequent: { constructor: 'else2' }
					},
					{
						condition: true,
						consequent: { constructor: 'else3' }
					}
				]
			}
		});
	},

	'If Else Else'() {
		assert.throws(function () {
			parser.parse('<if condition={foo}><else><else></if>');
		});
	},

	'For'() {
		var ast:templating.IParseTree;

		ast = parser.parse('<for each={foo}><widget is="Widget" /></for>');
		assert.deepEqual(ast, {
			constructors: [ prefix('templating/html/ui/Iterator'), 'Widget' ],
			root: {
				constructor: prefix('templating/html/ui/Iterator'),
				collection: { $bind: 'foo', direction: 1 },
				itemConstructor: {
					$ctor: {
						constructor: 'Widget'
					}
				}
			}
		});

		ast = parser.parse('<for each={foo} as="foo"><widget is="Widget" /></for>');
		assert.deepEqual(ast, {
			constructors: [ prefix('templating/html/ui/Iterator'), 'Widget' ],
			root: {
				constructor: prefix('templating/html/ui/Iterator'),
				collection: { $bind: 'foo', direction: 1 },
				as: 'foo',
				itemConstructor: {
					$ctor: {
						constructor: 'Widget'
					}
				}
			}
		});
	},

	'When'() {
		this.skip('TODO');
	},

	'Placeholder'() {
		var ast:templating.IParseTree;

		ast = parser.parse('<placeholder>');
		assert.deepEqual(ast, {
			constructors: [ prefix('templating/html/ui/Element') ],
			root: {
				constructor: prefix('templating/html/ui/Element'),
				children: [],
				content: [ { $placeholder: 'default' } ]
			}
		});

		ast = parser.parse('<placeholder name="foo">');
		assert.deepEqual(ast, {
			constructors: [ prefix('templating/html/ui/Element') ],
			root: {
				constructor: prefix('templating/html/ui/Element'),
				children: [],
				content: [ { $placeholder: 'foo' } ]
			}
		});
	},

	'Element'() {
		var ast:templating.IParseTree;

		ast = parser.parse('<div class={{foo}} data-baz="baz{blah}">hello {bar}</div>');
		assert.deepEqual(ast, {
			constructors: [ prefix('templating/html/ui/Element') ],
			root: {
				constructor: prefix('templating/html/ui/Element'),
				children: [],
				content: [
					'<div class="',
					{ $bind: 'foo', direction: 2 },
					'" data-baz="',
					{ $bind: [ 'baz', { $bind: 'blah', direction: 1 } ], direction: 1 },
					'">hello ',
					{ $bind: 'bar', direction: 1 },
					'</div>'
				]
			}
		});

		ast = parser.parse('<div><placeholder name="foo"></div>');
		assert.deepEqual(ast, {
			constructors: [ prefix('templating/html/ui/Element') ],
			root: {
				constructor: prefix('templating/html/ui/Element'),
				children: [],
				content: [
					'<div>',
					{ $placeholder: 'foo' },
					'</div>'
				]
			}
		});

		ast = parser.parse('<div><widget is="Widget">hello<widget is="Widget" /></widget><widget is="Widget" /></div>');
		assert.deepEqual(ast, {
			constructors: [ prefix('templating/html/ui/Element'), 'Widget' ],
			root: {
				constructor: prefix('templating/html/ui/Element'),
				children: [
					{
						constructor: 'Widget',
						children: [
							{
								constructor: prefix('templating/html/ui/Element'),
								children: [
									{ constructor: 'Widget' }
								],
								content: [
									'hello',
									{ $child: 0 }
								]
							}
						]
					},
					{ constructor: 'Widget' }
				],
				content: [
					'<div>',
					{ $child: 0 },
					{ $child: 1 },
					'</div>'
				]
			}
		});
	},

	'Element after Element'() {
		var ast = parser.parse('<div></div><widget is="Widget">Element</widget>');
		assert.deepEqual(ast, {
			constructors: [ prefix('templating/html/ui/Element'), 'Widget' ],
			root: {
				constructor: prefix('templating/html/ui/Element'),
				content: [
					'<div></div>',
					{ $child: 0 }
				],
				children: [
					{
						constructor: 'Widget',
						children: [
							{
								constructor: prefix('templating/html/ui/Element'),
								children: [],
								content: [ 'Element' ]
							}
						]
					}
				]
			}
		});
	},

	'HtmlComment'() {
		var ast:templating.IParseTree;

		ast = parser.parse('<!-- foo- {bar} -->');
		assert.deepEqual(ast, {
			constructors: [ prefix('templating/html/ui/Element') ],
			root: {
				constructor: prefix('templating/html/ui/Element'),
				content: [ '<!-- foo- {bar} -->' ],
				children: []
			}
		});

		ast = parser.parse('start<!-- foo {bar} -->end');
		assert.deepEqual(ast, {
			constructors: [ prefix('templating/html/ui/Element') ],
			root: {
				constructor: prefix('templating/html/ui/Element'),
				content: [ 'start<!-- foo {bar} -->end' ],
				children: []
			}
		});

		assert.throws(function () {
			parser.parse('<!------>');
		});

		assert.throws(function () {
			parser.parse('<!-- ---->');
		});
	},

	'Two-way binding'() {
		var ast = parser.parse('<widget is="Widget" class={{foo}} />');
		assert.deepEqual(ast, {
			constructors: [ 'Widget' ],
			root: {
				constructor: 'Widget',
				'class': { $bind: 'foo', direction: 2 }
			}
		});
	},

	'Binding with nested brackets'() {
		var ast = parser.parse('<widget is="Widget" class={foo{bar}} />');
		assert.deepEqual(ast, {
			constructors: [ 'Widget' ],
			root: {
				constructor: 'Widget',
				'class': { $bind: 'foo{bar}', direction: 1 }
			}
		});
	},

	'Binding with escaped brackets'() {
		var ast = parser.parse('<widget is="Widget" class={foo\\}\\{bar} />');
		assert.deepEqual(ast, {
			constructors: [ 'Widget' ],
			root: {
				constructor: 'Widget',
				'class': { $bind: 'foo}{bar', direction: 1 }
			}
		});
	}
});
