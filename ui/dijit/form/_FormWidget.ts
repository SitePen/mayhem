import configure = require('../configure');
import form = require('./interfaces');
import _FormWidgetMixin = require('./_FormWidgetMixin');
import _Widget = require('../_Widget');

class _FormWidget extends _Widget implements form.IFormWidget {
	get:form.IFormWidgetGet;
	set:form.IFormWidgetSet;
}

configure(_FormWidget, {
	Base: _Widget,
	mixins: [ _FormWidgetMixin ]
});

export = _FormWidget;
