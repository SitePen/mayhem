# HTML Templates



## Attributes

A widget's constructor is denoted with the `is` attribute, which all widgets must have:

```html
<widget is="foo"></widget>
```

```javascript
{
	constructor: 'foo'
}
```

A widget's attributes can have values which are single or double quoted strings (with backslash escaping). If an attribute value is be omitted completely it is interpreted as true (as is typical of HTML):

```html
<widget is="foo" single='yes' double="yep" escaped='"deep \'quote\'"' true></widget>
```

```javascript
{
	constructor: 'foo',
	kwArgs: {
		single: 'yes',
		'double': 'yep',
		escaped: '"deep \'quote\'"'
		'true': true
	}
}
```

Attribute values can be other kinds of literals too, such as true, false, null, or even numbers:

```html
<widget is="foo" true=true false=false null=null number=-12.3></widget>
```

```javascript
{
	constructor: 'foo',
	kwArgs: {
		'true': true,
		'false': false,
		'null': null,
		number: -12.3
	}
}
```

Attribute values can even be arbitrary JSON objects or arrays:

```html
<widget is="foo" array=[ "a", -2.1, {}, false ] object={}, string="{}"></widget>
```

```javascript
{
	constructor: 'foo',
	kwArgs: {
		array: [ 'a', -2.1, {}, false ],
		object: {},
		string: '{}'
	}
}
```

Like HTML, attribute names are considered case-insensitive, and names are mangled using the standard camel-case/camelCase translation:

```html
<widget is="foo" camelCase='nope' camel-case='yep' camel--case="WTF?"></widget>
```

```javascript
{
	constructor: 'foo',
	kwArgs: {
		camelcase: 'nope',
		camelCase: 'yep',
		'camel-Case': 'WTF?'
	}
}
```


## Bindings

Attribute value strings contain binding expressions anywhere within them.

```html
<widget is="foo" single="{foo}" anywhere="a {binding} can appear {any.where}"></widget>
```

Attribute values which contain bindings are processed by the parser and translated into a binding template – an array where each element is either a string or a binding descriptor:

```javascript
{
	constructor: 'foo',
	kwArgs: {
		single: [ { $bind: 'binding' } ]
		anywhere: [ 'a ', { $bind: 'binding' }, ' can appear ', { $bind: 'any.where' } ]
	}
}
```

Whenever any of the bound properties change the entire binding template will be reevaluated and the new value set on the property. It's important to note that binding templates only bind in one direction – from the mediator to the attribute property. If a bound attribute is set directly on a widget it wipes out the binding template completely.

Bidirectionally binding changes to some mediator property update the associated widget attribute and vice versa. This requires us to call out a single mediator property.

```html
<widget is="foo" one-way="{foo}" bi-di={bar.baz}></widget>
```

Bindings within strings always create binding templates (one-way), but unquoted bindings always bind bidirectionally. Note the difference between the two attribute values in the generated AST:

```javascript
{
	constructor: 'foo',
	kwArgs: {
		oneWay: [{ $bind: 'foo' }],
		biDi: { $bind: 'bar.baz' }
	}
}
```

## Metadata Bindings

Binding strings are considered opaque by the [binding system](../binding/README.md), but out of the box we have a binder that allows you reference the metadata of a given property using a special syntax... TODO


## Aliases

TODO


# Content and Children

Empty widgets must have a closing tag:

```html
<widget is="foo"></widget>
```

```javascript
{
	constructor: 'foo'
}
```

Widget with only whitespace content are distinguished from empty widgets:

```html
<widget is="foo">   </widget>
```
```javascript
{
	constructor: 'foo'
}
```
 
Single child widget with no whitespace:

```html
<widget is="foo"><widget is="bar"></widget></widget>
```
```javascript
{
	constructor: 'foo',
	children: [ { constructor: 'bar' } ]
}
```
 
Single child widget with only whitespace content:

```html
<widget is="foo"> <widget is="bar"></widget> </widget>
```
```javascript
{
	constructor: 'foo',
	children: [ { constructor: 'bar' } ]
}
```

If a widget only has children and whitespace the whitespace is collapsed:

```html
<widget is="foo"><widget is="bar"></widget> <widget is="baz"> </widget></widget>
```
```javascript
{
	constructor: 'foo',
	children: [ { constructor: 'bar' }, { constructor: 'baz' } ]
}
```
 
No child widgets, just arbitrary content:

```html
<widget is="foo"><br/></widget>
```
```javascript
{
	constructor: 'foo',
	content: '<br/>'
}
```
 
No child widgets, just a single binding with no whitespace:

```html
<widget is="foo">{bar}</widget>
```
```javascript
{
	constructor: 'foo',
	content: [ { $bind: 'bar' } ]
}
```
 
No child widgets, just a single binding with whitespace:

```html
<widget is="foo"> {bar}</widget>
```
```javascript
{
	constructor: 'foo',
	content: [ ' ', { $bind: 'bar' } ]
}
```
 
No child widgets, just arbitrary content and bindings:

```html
<widget is="foo">{bar} <br/></widget>
```
```javascript
{
	constructor: 'foo',
	content: [ { $bind: 'bar' }, ' <br/>' ]
}
```

Multiple child widgets with non-whitespace content, including arbitrary html and text bindings:

```html
<widget is="foo"><widget is="bar"></widget><b><i><widget is="baz" attr={bind}></widget></b>{$bind$}.</widget>
```
```javascript
{
	constructor: 'foo',
	children: [
		{ constructor: 'bar' },
		{ constructor: 'baz', { kwArgs: attr: { $bind: '$bind$' } } }
	],
	content: [
		{ $child: 0 },
		'<b><i>',
		{ $child: 1 },
		'</b>',
		{ $bind: '$bind' },
		'.'
	]
}
```

(Note: bindings outside of `<widget>` tags can only be placed in text nodes -- we do not yet support using bindings inside HTML tag heads).


## Multiple Top-level Widgets

The top level, or root, of a template may not contain just a single widget -- it might contain two or more widgets, or no widgets at all. If there are two or more widgets they have to be a child of something -- an implicit widget that may have children or content, even though it can't have any attributes of its own. Here's an example of two or more top-level widgets in the top level, mixed with arbitrary non-whitespace content:

```html
<widget is="foo"></widget><br><widget is="bar"></widget>
```

If the root isn't a single widget it uses the `View` templating widget for its constructor.

```javascript
{
	constructor: 'framework/templating/ui/View',
	children: [{ constructor: 'foo' }, { constructor: 'bar' }],
	content: [ { $child: 0 }, '<br>', { $child: 1 } ]
}
```

When there's no content at the top level other than the widgets and whitespace:
```html
<widget is="foo"></widget>
<widget is="bar"></widget>
```

In this case we don't need to track the locations of children with placeholders so the root widget has no content attribute:

```javascript
{
	constructor: 'framework/templating/ui/View',
	children: [{ constructor: 'foo' }, { constructor: 'bar' }]
}
```

A template may not contain any widgets at all, only content:

```html
Foo <em>bar.
```
```javascript
{
	constructor: 'framework/templating/ui/View',
	content: [ { $child: 0 }, '<br>', { $child: 1 } ]
}
```

In this case the constructor is again defaulted to the `View` templating widget. This content can still include text bindings or named placeholders:

```html
Foo <em>{bar}.<placeholder name="trailer">
```
```javascript
{
	constructor: 'framework/templating/ui/View',
	content: [ 'Foo <em>', { $bind: 'bar' }, '.', { $named: 'trailer' } ]
}
```

When there's just whitespace in a template, or no content at all, we still get a `View` widget, but there's not much to it:

```javascript
{
	constructor: 'framework/templating/ui/View'
}
```


## Named Placeholders

Named placeholders can also be inserted into content which leave a slot in the content node to be filled later:

```html
<widget is="foo">
	before
	<placeholder name="between">
	after
</widget>
```

The `<placeholder>` tag ends up as an object in the content template. In spite of it being an element it looks more like a binding marker than a widget in the parse tree:

```javascript
{
	constructor: 'foo',
	content: [ '\n\tbefore\n\t', { $named: 'between' }, '\n\tafter\n' ]
}
```

The "foo" widget will have to implement the `IView` interface or template processing will fail.

The `<placeholder>` element also plays nicely with other children and text bindings:

```html
<widget is="foo">
	{before}
	<widget is="foo"></widget><placeholder name="between"><widget is="foo"></widget>
	{after}
</widget>
```

```javascript
{
	constructor: 'foo',
	children: [{ constructor: 'foo' }, { constructor: 'foo' }],
	content: [
		'\n\t',
		{ $bind: 'before' },
		'\n\t',
		{ $child: 0 },
		{ $named: 'between' },
		{ $child: 1 },
		'\n\t',
		{ $bind: 'after' },
		'\n'
	]
}
```

Since `<placeholder>` is a void element these are all equivalent:
```html
<placeholder name="foo">
<placeholder name="foo"/>
<placeholder name="foo"></placeholder>
```
Of course, multiple placeholders with the same name cannot be inserted into the same content, so this will throw. (TODO: does this throw yet?)


## Attribute Referencing

There are circumstances where a widget needs another widget as a kwArg rather than a child. One example is a dropdown button, which might need to support arbitrary content for the button face – possibly including nested widgets – but also requires a widget allocated explicitly for use as the dropdown:

```html
<widget is="button" disabled dropdown=#dd-menu>
	Button Text...
	<widget is="menu" id="dd-menu">xxx</widget>
</widget>
```

```javascript
{
	constructor: 'button',
	kwArgs: {
		disabled: true,
		dropdown: {
			constructor: 'menu',
			kwArgs: {
				id: 'dd-menu'
			}
		}
	},
	children: [ null ],
	content: '\n\tButton Text...\n\t' + { $child: 0 } + '\n'
}
```

Attribute references eliminate ambiguity about which widget to use for the dropdown – the right widget will always be identified, even if our widget's content contains other widgets:

```html
<widget is="button" disabled dropdown=#dd-menu>
	<widget is="foo"></widget>
	<widget is="menu" id="dd-menu">xxx</widget>
	Button Text...
	<widget is="foo"></widget>
</widget>
```

Note that our AST node has other children so its children array is a mix of child markers and null values:

```javascript
{
	constructor: 'button',
	kwArgs: {
		disabled: true,
		dropdown: {
			constructor: 'menu'
			kwArgs: {
				id: 'dd-menu'
			},
			content: 'xxx'
		}
	},
	children: [{ constructor: 'foo' }, null, { constructor: 'foo' }],
	content: [ '\n\t', { $child: 0 }, '\n\t', { $child: 1 }, '\n\tButton Text...\n\t', { $child: 2 }, '\n' ]
}
```

All attribute references must have an associated child widget with a matching id or the parser will throw. For instance this will fail to parse:

```html
<widget is="button" dropdown=#nonexistent>
	<widget is="menu" id="dd-menu"></widget>
</widget>
```

The corresponding widget must be an immediate child of the referencing widget, so parsing will also fail for this template:

```html
<widget is="button" dropdown=#menu>
	<widget is="foo">
		<widget is="menu" id="dd-menu"></widget>
	</widget>
</widget>
```

(Note: we could eventually support deep references but restricting to the top level keeps things simple and covers the important cases.


### Referencing Actions

(NOTE: the `<action>` tag is not yet implemented and this needs a bit more discussion.)

We can use attribute references to wire up actions as well.

```html
<widget is="button" on-click=#click label="Click Me">
	<action id="click">
		console.log('clicked')
	</action>
</widget>
```

The parser transforms action nodes into functions and evaluates them before setting them as the value of the referencing attribute:

```javascript
{
	constructor: 'button',
	kwArgs: {
		onClick: function () { console.log('clicked') },
		label: 'Click Me'
	}
}
```

When it encounters attribute values which are functions the processor wraps them such that they are always called within the context of the owner widget's active mediator.


# [Templating Widgets](../ui/README.md)


# [Parse Tree Processing](../README.md)


# Future

We could allow custom elements to be registered right inside a template (just like `<alias>`).

```html
<register-widget tag="af-button" is="framework/ui/form/Button"/>
<af-button label="Click Me"></af-button>
```
This would be equivalent to:
```html
<widget is="framework/ui/form/Button" label="Click Me"></widget>
```

Widgets can also be denoted as void:
```html
<register-widget tag="af-input" is="framework/ui/form/TextInput" void/>
```
The following are all equivalent:
```html
<af-input value={field}></dijit-textbox>
<af-input value={field}/>
<af-input value={field}>
<widget is="framework/ui/form/TextInput" value={field}></widget>
```

Ideally we could limit the scope of widget registrations to the enclosing widget, which would make it possible to support redeclaring tag registrations in child scopes.


## Imports

Alternative widget sets could provide a template full of custom element definitions for their widgets. Definitions for the dijit widget set might look something like this:

```html
...
<register-widget tag="dijit-button" is="framework/ui/dijit/form/Button"/>
<register-widget tag="dijit-toggle-button" is="framework/ui/dijit/form/ToggleButton"/>
<register-widget tag="dijit-tabs" is="framework/ui/dijit/layout/TabContainer"/>
...
```

Templates using dijit widgets could be prefixed with this definition template. Eventually we could add template import functionality similar to HTML `<import>` which could load up a whole set of widget registration definitions from within a dependent template:

```html
<template-import path="framework/ui/dijit/definitions.html"/>
<dijit-button label="Click Me"></dijit-button>
```
