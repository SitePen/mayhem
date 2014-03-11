import configure = require('../configure');
import form = require('./interfaces');
import _Mixin = require('../_Mixin');

class _CheckBoxMixin extends _Mixin implements form.ICheckBoxMixin {
	get:form.ICheckBoxMixinGet;
	set:form.ICheckBoxMixinSet;
}

configure(_CheckBoxMixin, {
	schema: {
		readOnly: Boolean
	}
});

export = _CheckBoxMixin;
