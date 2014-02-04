import domUtil = require('./util');
import Widget = require('../Widget');
import widgets = require('../interfaces');

class MultiNodeWidget extends Widget implements widgets.IDomWidget {
	firstNode:Comment;
	private _fragment:DocumentFragment;
	lastNode:Comment;

	constructor(kwArgs:Object) {
		super(kwArgs);
		this._render();
	}

	detach():DocumentFragment {
		// TODO: attach event isn't being propagated properly, so fragment isn't always nulled out
		if (!this._fragment || !this._fragment.firstChild) {
			this._fragment = domUtil.getRange(this.firstNode, this.lastNode, true).extractContents();
		}

		return this._fragment;
	}

	empty():void {
		domUtil.getRange(this.firstNode, this.lastNode, true).deleteContents();
	}

	/* protected */ _render():void {
		var commentId:string = this.id.replace(/--/g, '\u2010\u2010');
		this.firstNode = document.createComment(commentId);
		this.lastNode = document.createComment('/' + commentId);

		var fragment:DocumentFragment = this._fragment = document.createDocumentFragment();
		fragment.appendChild(this.firstNode);
		fragment.appendChild(this.lastNode);

		// TODO: Figure out a better way to declaratively apply event handlers to self.
		this.on('attach', ():void => {
			this._fragment = null;
		});
	}
}

export = MultiNodeWidget;
