import DomPlaceholder = require('../../../ui/dom/Placeholder');
import processor = require('../../html');
import widgets = require('../../../ui/interfaces');

class TemplatingWidget extends DomPlaceholder {

	/* protected */ _constructWidget(node:any):widgets.IDomWidget {
		return node ? processor.widgetFromAst(node, { app: this.get('app'), parent: this }) : null;
	}

}

export = TemplatingWidget;
