import configure = require('../configure');
import form = require('./interfaces');
import _Mixin = require('../_Mixin');

class _FormWidgetMixin extends _Mixin implements form.IFormWidgetMixin {
	get:form.IFormWidgetMixinGet;
	set:form.IFormWidgetMixinSet;
}

configure(_FormWidgetMixin, {
	schema: {
		name: String,
		alt: String,
		value: String,
		type: String,
		'aria-label': String,
		tabIndex: String,
		disabled: Boolean,
		intermediateChanges: Boolean,
		scrollOnFocus: Boolean	
	}
});

export = _FormWidgetMixin;
