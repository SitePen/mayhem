import configure = require('../configure');
import form = require('./interfaces');
import _Mixin = require('../_Mixin');

class _TextBoxMixin extends _Mixin implements form.ITextBoxMixin {
	get:form.ITextBoxMixinGet;
	set:form.ITextBoxMixinSet;
}

configure(_TextBoxMixin, {
	schema: {
		trim: Boolean,
		uppercase: Boolean,
		lowercase: Boolean,
		propercase: Boolean,
		maxLength: String,
		selectOnClick: Boolean,
		placeHolder: String,
		onInput: Function
	}
});

export = _TextBoxMixin;
