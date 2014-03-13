import configure = require('../util/configure');
import form = require('./interfaces');
import _Mixin = require('../_Mixin');

class _ButtonMixin extends _Mixin implements form.IButtonMixin {
	get:form.IButtonMixinGet;
	set:form.IButtonMixinSet;
}

configure(_ButtonMixin, {
	schema: {
		label: String,
		onClick: Function,
		type: String
	}
});

export = _ButtonMixin;
