import domUtil = require('./util');
import Widget = require('../Widget');
import widgets = require('../interfaces');

class MultiNodeWidget extends Widget implements widgets.IDomWidget {
	firstNode:Comment;
	private _fragment:DocumentFragment;
	lastNode:Comment;

	constructor(kwArgs:Object) {
		super(kwArgs);

		var commentId:string = this.id.replace(/--/g, '\u2010\u2010');
		this.firstNode = document.createComment(commentId);
		this.lastNode = document.createComment('/' + commentId);

		var fragment:DocumentFragment = this._fragment = document.createDocumentFragment();
		fragment.appendChild(this.firstNode);
		fragment.appendChild(this.lastNode);
	}

	detach():DocumentFragment {
		this._fragment = domUtil.getRange(this.firstNode, this.lastNode, true).extractContents();
		super.detach();
		return this._fragment;
	}
}

export = MultiNodeWidget;
