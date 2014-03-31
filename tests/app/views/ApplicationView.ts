import Master = require('framework/ui/Master');
import Placeholder = require('framework/ui/Placeholder');
import domConstruct = require('dojo/dom-construct');

class ApplicationView extends Master {
	_render():void {
		super._render();

		var header:HTMLElement = domConstruct.create('div', {
			className: 'header'
		}, (<any>this)._firstNode, 'after');

		var main:HTMLElement = domConstruct.create('div', {
			className: 'main'
		}, header, 'after');

		var p = this.placeholders['default'] = new Placeholder();
		domConstruct.place((<any>p)._outerFragment, main);
	}
}

export = ApplicationView;
