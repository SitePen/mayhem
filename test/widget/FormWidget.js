define([
	'teststack!bdd',
	'teststack/chai!expect',
	'../../widget/FormWidget',
	'dojo/dom-construct',
	'dojo/dom-class',
	'dojo/_base/declare'
], function (bdd, expect, FormWidget, domConstruct, domClass, declare) {
	bdd.describe('FormWidget', function () {

		var parentNode,
			placeholderNode,
			widget;

		bdd.beforeEach(function () {
			parentNode = domConstruct.create('div', null, document.body);
			placeholderNode = domConstruct.create('div', null, parentNode);
		});

		bdd.afterEach(function () {
			if (widget) {
				widget.destroy();
				widget = null;
			}
			domConstruct.destroy(parentNode);
			parentNode = null;
			placeholderNode = null;
		});

		var TestWidget = declare(FormWidget, {
			_create: function () {
				this.domNode = this._controlNode = domConstruct.create('input', { type: 'text'});
				this.inherited(arguments);
			}
		});

		bdd.it('should mark itself with a formWidget CSS class', function () {
			widget = new TestWidget();
			expect(domClass.contains(widget.domNode, 'formWidget')).to.be.true;
		});

		bdd.it('should support a name property', function () {
			widget = new TestWidget();

			expect(widget).to.have.property('name');
			widget.set('name', 'expected-name');
			expect(widget.get('name')).to.equal('expected-name');
			expect(widget._controlNode.name).to.equal('expected-name');
		});

		bdd.it('should support a value property', function () {
			widget = new TestWidget();
			expect(widget).to.have.property('value');
			widget.set('value', 'expected-value');
			expect(widget.get('value')).to.equal('expected-value');
		});

		bdd.it('should support a tabIndex property', function () {
			var expectedTabIndex = 42;
			widget = new TestWidget({ tabIndex: expectedTabIndex });
			expect(widget).to.have.property('tabIndex');
			expect(widget.get('tabIndex')).to.equal(expectedTabIndex);
			expect(widget.domNode.tabIndex).to.equal(expectedTabIndex);
		});

		bdd.it('should support a disabled property', function () {
			widget = new TestWidget();

			expect(widget).to.have.property('disabled');
			widget.set('disabled', true);
			expect(widget.get('disabled')).to.be.true;
			expect(widget._controlNode.disabled).to.be.true;
		});

		bdd.it('should add a disabled-related CSS class when widget.disabled is true', function () {
			widget = new TestWidget();

			expect(domClass.contains(widget.domNode, 'widgetDisabled')).to.be.false;
			widget.set('disabled', true);
			expect(domClass.contains(widget.domNode, 'widgetDisabled')).to.be.true;
		});

		bdd.it('should reset to its value at startup when reset() is called', function () {
			widget = new TestWidget({ value: 'initial-value' }, placeholderNode);

			widget.set('value', 'value-at-startup');
			widget.startup();

			widget.set('value', 'new-value');
			expect(widget.get('value')).to.equal('new-value');

			widget.reset();
			expect(widget.get('value')).to.equal('value-at-startup');
		});

		bdd.it('should set focus on itself when focus() is called', function () {
			widget = new TestWidget(null, placeholderNode);
			widget.startup();

			expect(document.activeElement).to.not.equal(widget.domNode);
			widget.focus();
			expect(document.activeElement).to.equal(widget.domNode);
		});

		bdd.it('should emit a focus event when focused', function () {
			widget = new TestWidget(null, placeholderNode);
			widget.startup();

			var emittedFocusEvent;
			widget.on('focus', function (event) {
				emittedFocusEvent = event;
			});
			widget.focus();
			expect(emittedFocusEvent).to.not.be.undefined;
			expect(emittedFocusEvent.type).to.equal('focus');
		});

		bdd.it('should emit a blur event when it loses focus', function () {
			widget = new TestWidget(null, placeholderNode);
			widget.startup();

			var anElementToTakeFocus = domConstruct.create('div', { tabindex: 0 });
			parentNode.appendChild(anElementToTakeFocus);

			widget.focus();
			var emittedBlurEvent;
			widget.on('blur', function (event) {
				emittedBlurEvent = event;
			});

			anElementToTakeFocus.focus();
			expect(emittedBlurEvent).to.not.be.undefined;
			expect(emittedBlurEvent.type).to.equal('blur');
		});
	});
});