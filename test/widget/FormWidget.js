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
			widget;

		bdd.beforeEach(function () {
			parentNode = domConstruct.create('div', null, document.body);
		});

		bdd.afterEach(function () {
			if (widget) {
				widget.destroy();
				widget = null;
			}
			domConstruct.destroy(parentNode);
			parentNode = null;
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

		bdd.it('should support a disabled property', function () {
			widget = new TestWidget();

			expect(widget).to.have.property('disabled');
			widget.set('disabled', true);
			expect(widget.get('disabled')).to.be.true;
			expect(widget._controlNode.disabled).to.be.true;
		});

		bdd.it('should add a disabled-related CSS class when widget.disabled is true', function () {
			widget = new TestWidget();

			expect(domClass.contains(widget.domNode, 'mayhemWidgetDisabled')).to.be.false;
			widget.set('disabled', true);
			expect(domClass.contains(widget.domNode, 'mayhemWidgetDisabled')).to.be.true;
		});

		bdd.it('should reset to its value at startup when reset() is called', function () {
			widget = new TestWidget({ value: 'initial-value' });

			widget.set('value', 'value-at-startup');
			parentNode.appendChild(widget.domNode);
			widget.startup();

			widget.set('value', 'new-value');
			expect(widget.get('value')).to.equal('new-value');

			widget.reset();
			expect(widget.get('value')).to.equal('value-at-startup');
		});
	});
});