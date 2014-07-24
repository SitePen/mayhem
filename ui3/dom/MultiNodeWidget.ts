import domUtil = require('./util');
import Widget = require('./Widget');

class MultiNodeWidget extends Widget {
	/**
	 * @protected
	 */
	_firstNode:Comment;

	/**
	 * @protected
	 */
	_lastNode:Comment;

	detach():DocumentFragment {
		return domUtil.extractContents(this._firstNode, this._lastNode);
	}

	_render():void {
		var commentId:string = this._id.replace(/--/g, '\u2010\u2010');
		this._firstNode = document.createComment(commentId);
		this._lastNode = document.createComment('/' + commentId);

		var fragment:DocumentFragment = document.createDocumentFragment();
		fragment.appendChild(this._firstNode);
		fragment.appendChild(this._lastNode);
	}
}

module MultiNodeWidget {
	export interface Events extends Widget.Events {}
	export interface Getters extends Widget.Getters {
		(key:'firstNode'):Comment;
		(key:'lastNode'):Comment;
	}
	export interface Setters extends Widget.Setters {}
}

export = MultiNodeWidget;
