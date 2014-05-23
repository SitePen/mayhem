/// <amd-dependency path="./renderer!Text" />

import View = require('./View');
import ui = require('./interfaces');
import util = require('../util');

var Renderer:any = require('./renderer!Text');
/**
 * The TextView manages plain text views in the Mayhem UI.
 * @class ui/TextView
 * @extends  ui/View
 * @implements ui/IText
 * @property {ui/ITextGet} get - getters for accessing protected TextView properties.
 * @property {ui/ITextSet} set - setters for accessing protected TextView properties.
 *
 */

class TextView extends View implements ui.IText {

	get:ui.ITextGet;
	set:ui.ITextSet;

	/**
	* Creates a TextView instance.
	* @constructor
	* @class ui/TextView
	* @param {Object} kwArgs - keyword arguments
	*/
	constructor(kwArgs?:any) {
		util.deferMethods(this, [ 'setContent' ], '_render');
		super(kwArgs);
	}

	/**
	 * Render the TextView content.
	 * @public
	 * @name ui/TextView#setContent
	 * @function
	 * @param {string} content - string content to be displayed
	 */
	setContent(content:string):void {
		this._renderer.setContent(this, content);
	}
}

TextView.prototype._renderer = new Renderer();

export = TextView;
