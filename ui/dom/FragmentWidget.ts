import domUtil = require('./util');
import ui = require('../interfaces');
import Widget = require('../Widget');

class FragmentWidget extends Widget implements ui.IFragmentWidget {
	/* protected */ _firstNode:Comment;
	/* protected */ _fragment:DocumentFragment;
	/* protected */ _lastNode:Comment;

	detach():DocumentFragment {
		// TODO: attach event isn't being propagated properly, so fragment isn't always nulled out
		if (!this._fragment || !this._fragment.firstChild) {
			this._fragment = domUtil.getRange(this._firstNode, this._lastNode, true).extractContents();
		}
		return this._fragment;
	}

	clear():void {
		domUtil.getRange(this._firstNode, this._lastNode, true).deleteContents();
	}

	/* protected */ _render():void {
		var commentId:string = ((<any> this.constructor).name || '') + '#' + this.get('id').replace(/--/g, '\u2010\u2010');
		this._firstNode = document.createComment(commentId);
		this._lastNode = document.createComment('/' + commentId);

		var fragment:DocumentFragment = this._fragment = document.createDocumentFragment();
		fragment.appendChild(this._firstNode);
		fragment.appendChild(this._lastNode);

		// TODO: Figure out a better way to declaratively apply event handlers to self.
		this.on('attach', ():void => {
			this._fragment = null;
		});

		super._render();
	}
}

export = FragmentWidget;
