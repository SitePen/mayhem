import domUtil = require('./util');
import Widget = require('../Widget');
import widgets = require('../interfaces');

class MultiNodeWidget extends Widget implements widgets.IDomWidget {
	firstNode:Comment;
	private _fragment:DocumentFragment;
	lastNode:Comment;

	constructor(kwArgs:Object) {
		super(kwArgs);
		this.render();
	}

	detach():DocumentFragment {
		if (!this._fragment) {
			this._fragment = domUtil.getRange(this.firstNode, this.lastNode, true).extractContents();
		}

		super.detach();
		return this._fragment;
	}

	render():void {
		var commentId:string = this.id.replace(/--/g, '\u2010\u2010');
		this.firstNode = document.createComment(commentId);
		this.lastNode = document.createComment('/' + commentId);

		var fragment:DocumentFragment = this._fragment = document.createDocumentFragment();
		fragment.appendChild(this.firstNode);
		fragment.appendChild(this.lastNode);

		// TODO: Figure out a better way to declaratively apply event handlers to self.
		this.on('attach', () => {
			this._fragment = null;
		});
	}

	empty():void {
		domUtil.getRange(this.firstNode, this.lastNode, true).deleteContents();
	}
}

export = MultiNodeWidget;
