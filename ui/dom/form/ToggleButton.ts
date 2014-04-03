import ButtonRenderer = require('./Button');
import form = require('./interfaces');
import touch = require('dojo/touch');

class ToggleButtonRenderer extends ButtonRenderer {
	initialize(widget:form.IToggleButton):void {
		super.initialize(widget);

		widget.observe('selected', (value:boolean) => {
			widget.classList.toggle('selected', value);
		});
	}
}

export = ToggleButtonRenderer;
