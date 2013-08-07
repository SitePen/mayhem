define([
	'intern/chai!bdd',
	'intern/chai!expect',
	'../../widget/Form',
	'dojo/_base/declare',
	'dojo/dom-construct'
], function (bdd, expect, Form, declare, domConstruct) {
	bdd.describe('Form', function () {

		var widget = null;

		bdd.afterEach(function () {
			if (widget) {
				widget.destroy();
				widget = null;
			}
		});

		// NOTE: It would be great to have a test verifying that the default action is
		// prevented for form submissions, but it is unclear to me how that can be done well
		// in an in-browser test. Failures could cause the browser to navigate away
		// from the executing test set.

		bdd.it('should emit a submit event when the form is submitted', function () {
			// Calling form.submit() doesn't appear cause dispatch of a DOM submit event,
			// so we're manually adding and clicking a submit button to trigger dispatch instead.
			var SubmitButtonForm = declare(Form, {
				submitButtonNode: null,
				_create: function () {
					this.inherited(arguments);
					this.submitButtonNode = domConstruct.toDom('<input type="submit">');
					this.domNode.appendChild(this.submitButtonNode);
				}
			});
			widget = new SubmitButtonForm();

			var emittedSubmitEvent = false;
			widget.on('submit', function () {
				emittedSubmitEvent = true;
			});
			widget.submitButtonNode.click();
			expect(emittedSubmitEvent).to.be.true;
		});
	});
});
