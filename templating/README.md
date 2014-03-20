# Templating

The primary way to author templates is with an [HTML-like syntax](html/README.md), but the templating system is designed be extremely plugable. Once you understand the structure and semantics of our parse trees it should be relatively easy to plug in other templating languages, or write your own, so long as your output adheres to the parse tree interface. You can even get by without a templating language at all, and just use plain old objects or JSON for your templates.

## IParseTree

### constructor

### kwArgs

### children

### content


# Parse Tree Processing

(TODO: needs to be aligned w/ the code)

To get a better intuition for what to expect the widget template constructor to do it may be instructive to compare it with some nearly equivalent imperative code. Below is an HTML template (a tab container with a few children and some bindings) and the parse tree that results. Compare this to some raw javascript that does about the same thing:

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