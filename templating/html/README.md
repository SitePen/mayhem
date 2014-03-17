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
	constructor: 'framework/templating/html/ui/View',
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
	constructor: 'framework/templating/html/ui/View',
	children: [{ constructor: 'foo' }, { constructor: 'bar' }]
}
```

A template may not contain any widgets at all, only content:

```html
Foo <em>bar.
```
```javascript
{
	constructor: 'framework/templating/html/ui/View',
	content: [ { $child: 0 }, '<br>', { $child: 1 } ]
}
```

In this case the constructor is again defaulted to the `View` templating widget. This content can still include text bindings or named placeholders:

```html
Foo <em>{bar}.<placeholder name="trailer">
```
```javascript
{
	constructor: 'framework/templating/html/ui/View',
	content: [ 'Foo <em>', { $bind: 'bar' }, '.', { $named: 'trailer' } ]
}
```

When there's just whitespace in a template, or no content at all, we still get a `View` widget, but there's not much to it:

```javascript
{
	constructor: 'framework/templating/html/ui/View'
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


# Templating Widgets

The templating language has a few widgets baked in to make it easier to express concepts like control flow...

## Iterator

(TODO: this doesn't align with the code)

```html
<for each="fieldValue" in="iterable">
	This is a template for each item in the iterable, including its value: {fieldValue}.
</for>
```
```javascript
{
	constructor: 'framework/templating/html/ui/Iteration',
	kwArgs: {
		each: 'fieldValue',
		in: 'iterable'
	},
	content: [
		'This is a template for each item in the iterable, including its value: ',
		{ $bind: 'fieldValue' }
	]
}
```

The `<for>` tag is just a convenience -- you could also build up an iterator just from `<widget>` tags. This template yields a parse tree that's essentially equivalent to the one above:

```html
<widget is="framework/templating/html/ui/Iteration" each="fieldValue" in="iterable" >
	This is a template for each item in the iterable, including its value: {fieldValue}.
</widget>
```

The `in` attribute of Iteration widgets is required, and it must reference an iterable property on the widget mediator.

The optional `each` attribute defines a new property for the mediator of the content widget that will yield the value of the current item in the iterator. This scoped mediator only cares about the property named defined by the `each` attribute and otherwise defers to the Iterator widget's mediator for all other properties.

The optional `index` attribute surfaces the index or key of the iterator's current item in the scoped mediator created for the content widget.



## Conditional

```html
<if condition="firstCondition">
	Content for when first condition matches...
<elseif condition="secondCondition" id="first-alternative">
	Content for when second condition matches...
<elseif condition="thirdCondition">
	Content for when third condition matches...
<else>
	Fallback content...
</if>
```

The `<elseif>` clauses, as well as the `<else>`, are completely optional. If not provided, the content of the `<if>` widget will be emptied when its `condition` is false. Closing tags `</elseif>` and `</else>` are optional.

The `<elseif>` and `<else>` elements are represented in the parse tree as nested Conditional templates. The `Conditional` just toggles between its content (if its condition is `true`) or its `alternative` widget, if provided.

```javascript
{
	constructor: 'framework/templating/html/ui/Conditional',
	kwArgs: {
		condition: 'firstCondition',
		alternate: {
			constructor: 'framework/templating/html/ui/Conditional',
			kwArgs: {
				condition: 'secondCondition',
				id: 'first-alternative',
				alternate: {
					constructor: 'framework/templating/html/ui/Conditional',
					kwArgs: {
						condition: 'thirdCondition',
						alternate: {
							constructor: 'framework/templating/html/ui/View',
							content: 'Fallback content...'
						}
					},
					content: 'Content for when third condition matches...'
				}
			},
			content: 'Content for when second condition matches...'
		}
	},
	content: 'Content for when first condition matches...'
}
```

If a statement has a `condition` an `alternative` is optional -- no `condition` implies a statement is an `else` clause and must not have an `alternative`.


Here's a nearly-equivalent template done manually (the only difference is that we had to create ids for all alternative widgets to be able to reference them):

```html
<widget is="framework/templating/html/ui/Conditional" condition="firstCondition" alternate=#first-alternative>
	Content for when first condition matches...
	<widget is="framework/templating/html/ui/Conditional" condition="secondCondition" id="first-alternative" alternate=#alt2>
		Content for when second condition matches...
		<widget is="framework/templating/html/ui/Conditional" condition="thirdCondition" id="alt3" alternate=#alt4>
			Content for when third condition matches...
			<widget is="framework/templating/html/ui/View" id="alt4">
				Fallback content...
			</widget>
		</widget>
	</widget>
</widget>
```


## When

The `<when>` tag can be used to wait on a remote value and show content when it is available. Optionally, content can be specified to be shown while the promise resolves using the `<during>` tag which can get access to the underlying promise's `progress` data. Error content may also be specified using the `<error>` tag in the case of promise rejection.

```html
<when promise="remoteField" value="resolvedValue">
	Content for when promise resolves...
<during>
	Content for promise progress...
<error id="custom-id">
	Content for promise rejection...
</when>
```

The closing tags `</during>` and `</error>` are optional.

```javascript
{
	constructor: 'framework/templating/html/ui/When',
	kwArgs: {
		promise: 'remoteField',
		value: 'resolvedValue',
		during: {
			constructor: 'framework/templating/html/ui/View',
			content: 'Content for promise progress...'
		},
		error: {
			constructor: 'framework/templating/html/ui/View',
			kwArgs: { id: 'custom-id' },
			content: 'Content for promise rejection...'
		}
	},
	content: 'Content for when promise resolves...'
}
```

We could build this template purely from `<widget>` composition too:

```html
<widget is="framework/templating/html/ui/When" promise="remoteField" value="resolvedValue" during=#dur error=#custom-id>
	Content for when promise resolves...
	<widget is="framework/templating/html/ui/View" id="dur">Content for promise promise...</widget>
	<widget is="framework/templating/html/ui/View" id="custom-id">Content for promise rejection...</widget>
</widget>
```


# Parse Tree Processing

(TODO: move to templating README)

To get a better intuition for what to expect the AST processing to do it may help to compare it with some effectively equivalent imperative code.

Here's an example of a tab container with a few children and some bindings:

```html
<widget id="tabs" is="tab-container">
	<widget is="content-pane" title={firstTabTitle}>
		Content of Tab 1
	</widget>
	<widget is="content-pane" title="{secondTabTitle}" selected>
		Content of Tab 2, with {someBinding}...
	</widget>
</widget>
```

The parse tree we should expect this to generate isn't much more complex:

```javascript
{
	constructor: 'tab-container',
	kwArgs: {
		id: 'tabs'
	},
	children: [{
		constructor: 'content-pane',
		kwArgs: {
			title: { $bind: 'firstTabTitle' }
		},
		content: 'Content of Tab 1...'
	},
	{
		constructor: 'content-pane',
		kwArgs: {
			id: 'tab2',
			title: [{ $bind: 'secondTabTitle' }],
			selected: true
		},
		content: [ 'Content of Tab 2, with ', { $bind: 'someBinding' }, '...' ]
	}]
}
```

Let's look at some imperative code that does approximately the same thing we'd expect our AST processor to do:

```javascript
var tabs = new TabContainer({ id: 'tabs' });

var tab1 = new ContentPane({
	title: 'initial value of firstTabTitle'
});
// bound attributes are populated with its initial property set if a mediator exists at instantiation time
// otherwise it is set as soon as an active mediator is provided
// if no `app` property exists on widget then binding is deferred until an app object is set
tab1.bind('title', 'firstTabTitle');
tab1.setContent('Content of Tab 1...');
tabs.add(tab1);

var tab2 = new ContentPane({
	id: 'tab2',
	title: 'initial value of secondTabTitle',
	selected: true
});
tab1.bindTemplate('title', [{ $bind: 'secondTabTitle' }]);
tab2.setContent('Content of Tab 2, with <!-- {"$bind":"binding"} -->...');
tabs.add(tab2);
```

As you can see, the template is a bit more concise than the AST, but both are arguably more legible and less error-prone than the programmatic example above.



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
