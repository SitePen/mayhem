import DomPlaceholder = require('../../../ui/dom/Placeholder');
import Processor = require('../../html');
import widgets = require('../../../ui/interfaces');

class TemplatingWidget extends DomPlaceholder {
	/* protected */ _constructWidget(node:any):widgets.IDomWidget {
		if (node == null) {
			return node;
		}
		return Processor.widgetFromAst(node, this.get('app'), { parent: this });
	}

}

export = TemplatingWidget;
