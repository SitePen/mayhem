import dom = require('./interfaces');
import domUtil = require('../../ui/dom/util');
import DomRenderer = require('./Renderer');
import ui = require('../interfaces');

class FragmentRenderer extends DomRenderer {
	destroy(widget:dom.IWidget):void {
		widget.set({
			firstNode: null,
			fragment: null,
			lastNode: null
		});
	}

	render(widget:dom.IWidget):void {
		var commentId:string = ((<any> widget.constructor).name || '') + '#' + widget.get('id').replace(/--/g, '\u2010\u2010');

		var firstNode = document.createComment(commentId),
			lastNode = document.createComment('/' + commentId),
			fragment = document.createDocumentFragment();

		fragment.appendChild(firstNode);
		fragment.appendChild(lastNode);

		widget.set({
			firstNode: firstNode,
			fragment: fragment,
			lastNode: lastNode
		});
	}
}

export = FragmentRenderer;
