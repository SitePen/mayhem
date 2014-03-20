import DijitRenderer = require('../../dom/_Dijit');

class ControlRenderer extends DijitRenderer {
}

ControlRenderer.delegate(DijitRenderer, '_dijitRename', {
	tabindex: 'tabIndex'
});

export = ControlRenderer;
