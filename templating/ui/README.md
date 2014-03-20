# Templating Widgets

The templating language has a few widgets baked in to make it easier to express control flow concepts. For convenience these concepts have specially defined structures in [HTML templates](../html/README.md) which are shown below, just before the parse tree that results.


## Iterator

(TODO: this doesn't align with the code)

```html
<for each="fieldValue" in="iterable">
	This is a template for each item in the iterable, including its value: {fieldValue}.
</for>
```
```javascript
{
	constructor: 'framework/templating/ui/Iteration',
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
<widget is="framework/templating/ui/Iteration" each="fieldValue" in="iterable" >
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
	constructor: 'framework/templating/ui/Conditional',
	kwArgs: {
		condition: 'firstCondition',
		alternate: {
			constructor: 'framework/templating/ui/Conditional',
			kwArgs: {
				condition: 'secondCondition',
				id: 'first-alternative',
				alternate: {
					constructor: 'framework/templating/ui/Conditional',
					kwArgs: {
						condition: 'thirdCondition',
						alternate: {
							constructor: 'framework/templating/ui/View',
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
<widget is="framework/templating/ui/Conditional" condition="firstCondition" alternate=#first-alternative>
	Content for when first condition matches...
	<widget is="framework/templating/ui/Conditional" condition="secondCondition" id="first-alternative" alternate=#alt2>
		Content for when second condition matches...
		<widget is="framework/templating/ui/Conditional" condition="thirdCondition" id="alt3" alternate=#alt4>
			Content for when third condition matches...
			<widget is="framework/templating/ui/View" id="alt4">
				Fallback content...
			</widget>
		</widget>
	</widget>
</widget>
```


## Resolver

The `<when>` tag can be used to wait on a promise, typically representing a remote value, and show content when it is available. Optionally, content can be specified to be shown while the promise resolves using the `<during>` tag which can get access to the underlying promise's `progress` data. Error content may also be specified using the `<error>` tag in the case of promise rejection.

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
	constructor: 'framework/templating/ui/Resolver',
	kwArgs: {
		promise: 'remoteField',
		value: 'resolvedValue',
		during: {
			constructor: 'framework/templating/ui/View',
			content: 'Content for promise progress...'
		},
		error: {
			constructor: 'framework/templating/ui/View',
			kwArgs: { id: 'custom-id' },
			content: 'Content for promise rejection...'
		}
	},
	content: 'Content for when promise resolves...'
}
```

We could build this template purely from `<widget>` composition too:

```html
<widget is="framework/templating/ui/Resolver" promise="remoteField" value="resolvedValue" during=#dur error=#custom-id>
	Content for when promise resolves...
	<widget is="framework/templating/ui/View" id="dur">Content for promise promise...</widget>
	<widget is="framework/templating/ui/View" id="custom-id">Content for promise rejection...</widget>
</widget>
```