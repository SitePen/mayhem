define([], function () {
	function createWidget(descriptor/*:Object*/) {
		var Ctor = require(descriptor.constructor),
			widget = new Ctor(),
			k;

		// TODO: Do this on a separate layer instead of delegating functionality to the widget?
		for (k in descriptor.properties) {
			widget.bind(k, descriptor.properties[k]);
		}

		for (k in descriptor.on) {
			widget.on(k, descriptor.on[k]);
		}

		var children = descriptor.children;
		if (widget.canHaveChildren !== false && children && children.length) {
			throw new Error('Cannot put children inside childless widget');
		}

		children && children.forEach(function (childDescriptor) {
			// widget can override `add` to set revised mediator on child that enables rebinding to another object,
			// for e.g. iterators
			widget.add(createWidget(childDescriptor));
		});

		return widget;
	}

	var widget = function () {},
		binding = function () {};

/*
<div>
	<if condition="{foo}">
		foo is true
	<else>
		foo is false
	</if>
	<w is="fww/Container" title="{title}">
		<w is="fww/Text">a b {createUrl('foo')} d {e}</w>
	</w>
	<div className="{foo}">
		i like <b>{mediator.name}</b>: <w is="fww/form/Button" on-action="{foo}" label="me too"></w>
	</div>
</div>
*/
	return createWidget({
		constructor: 'widgets/html/View',
		properties: {
			data: [
				'<div>',
				widget({
					constructor: 'widgets/html/Conditional',
					properties: {
						test: binding('foo'),
						consequent: [
							'foo is true'
						],
						alternate: [
							'foo is false'
						]
					}
				}),
				widget({
					constructor: 'widgets/Container',
					properties: {
						title: [
							binding('title')
						]
					},
					children: [
						// TODO: should there be a way for the widget prototype to specify that its content goes to
						// one of its properties?
						widget({
							constructor: 'widgets/Text',
							properties: {
								text: [
									'a b ',
									binding('createUrl(\'foo\')'),
									' d ',
									binding('e')
								]
							}
						})
					]
				}),
				widget({
					constructor: 'widgets/html/View',
					properties: {
						data: [
							'\n\t<div className="{foo}">\n\t\ti like <b>',
							binding('mediator.name'),
							'</b>: ',
							widget({
								constructor: 'widgets/form/Button',
								// A note: HTML buttons can composite lots of stuff into the button, but Android/iOS
								// not so much.
								properties: {
									label: [
										'me too'
									]
								},

								// TODO: What kinds of events should actually be hooked up to pass to the mediator,
								// and how?
								on: {
									action: binding('foo')
								}
							}),
							'\n\t</div>'
						]
					}
				}),
				'</div>'
			]
		}
	});
});
