import domUtil = require('./util');
import DomWidget = require('./DomWidget');
import ui = require('../interfaces');

class FragmentWidget extends DomWidget implements ui.IFragmentWidget {
	/* protected */ _firstNode:Comment;
	/* protected */ _fragment:DocumentFragment;
	/* protected */ _lastNode:Comment;

	detach():void {
		// TODO: attach event isn't being propagated properly, so fragment isn't always nulled out
		if (!this._fragment || !this._fragment.firstChild) {
			this._fragment = domUtil.getRange(this._firstNode, this._lastNode).extractContents();
		}
		super.detach();
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

		super._render();
	}

	_attachedSetter(attached:boolean) {
		super._attachedSetter(attached);
		if (attached) {
			// TODO: timing issues around detach/reattach?
			this._fragment = null;
		}
	}
}

export = FragmentWidget;
