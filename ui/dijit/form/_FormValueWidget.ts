import configure = require('../configure');
import form = require('./interfaces');
import _FormWidget = require('./_FormWidget');

class _FormValueWidget extends _FormWidget implements form.IFormValueWidget {
	get:form.IFormValueWidgetGet;
	set:form.IFormValueWidgetSet;
}

configure(_FormValueWidget, {
	Base: _FormWidget,
	schema: {
		readOnly: Boolean
	}
});

export = _FormValueWidget;
