import Container = require('../../../ui/dom/Container');
import domConstruct = require('dojo/dom-construct');
import has = require('../../../has');

class Element extends Container {
	get:Element.Getters;
	on:Element.Events;
	set:Element.Setters;

	private _content:string;
	private _placeholders:any[];

	_render():void {
		super._render();

		var content:Node = domConstruct.toDom(this._content);
		this._lastNode.parentNode.insertBefore(content, this._lastNode);


	}
}

module Element {
	export interface Events extends Container.Events {}
	export interface Getters extends Container.Getters {}
	export interface Setters extends Container.Setters {}
}

export = Container;
