import domUtil = require('./util');
import Widget = require('./Widget');

class MultiNodeWidget extends Widget {
	/**
	 * @protected
	 * @get
	 */
	_firstNode:Comment;

	/**
	 * @protected
	 */
	_fragment:DocumentFragment;

	/**
	 * @protected
	 * @get
	 */
	_lastNode:Comment;

	get:MultiNodeWidget.Getters;
	on:MultiNodeWidget.Events;
	set:MultiNodeWidget.Setters;

	constructor(kwArgs?:HashMap<any>) {
		super(kwArgs);
		// TODO: Use a unique-per-app key name
		// TS7017
		(<any> this._firstNode)['widget'] = (<any> this._lastNode)['widget'] = this;
	}

	destroy():void {
		// TS7017
		(<any> this._firstNode)['widget'] = (<any> this._lastNode)['widget'] = null;
		super.destroy();
	}

	detach():DocumentFragment {
		if (this._firstNode.parentNode !== this._fragment) {
			this._fragment = domUtil.extractContents(this._firstNode, this._lastNode);
		}
		super.detach();
		return this._fragment;
	}

	_render():void {
		var commentId:string = this._id.replace(/--/g, '\u2010\u2010');
		this._firstNode = document.createComment(commentId);
		this._lastNode = document.createComment('/' + commentId);

		// An initial fragment is necessary in order to provide a clear parent for any elements that are added to the
		// widget while it is detached
		var fragment:DocumentFragment = this._fragment = document.createDocumentFragment();
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
