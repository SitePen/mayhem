import widgets = require('../interfaces');
import DomPlaceholder = require('./Placeholder');
import domUtil = require('./util');
import array = require('dojo/_base/array');

// TODO: extend Placeholder?
class DomConditional extends DomPlaceholder {

	private static eval(condition:any):Function {
		// TODO: bindings and whatnot
		return function() {
			return eval(condition.join(''));
		}
	}

	private _predicates:Function[];
	private _clauseWidgets:widgets.IDomWidget[]; // TODO: StatefulArray, perhaps?
	private _parser:any;

	constructor(kwArgs:any) {
		this._parser = kwArgs.parser;
		kwArgs.parser = undefined;
		this._predicates = [];
		this._clauseWidgets = [];

		// Instantiate all conditional widgets, and alternate, regardless of predicate status
		if (kwArgs.conditions) {
			array.forEach(kwArgs.conditions, (condition:any) => {
				this._predicates.push(DomConditional.eval(condition.condition));
				this._clauseWidgets.push(this._parser.constructWidget(condition.content));
			});
			kwArgs.conditions = undefined;
		}
		if (kwArgs.alternate) {
			this._clauseWidgets.push(this._parser.constructWidget(kwArgs.alternate));
			kwArgs.alternate = undefined;
		}

		super(kwArgs);

		// TODO: bindings and whatnot
		this._refresh();
	}

	// Evaluate predicate condition and switch currently attached widget if necessary
	private _refresh():void {
		var i:number = 0,
			length:number = this._clauseWidgets.length,
			widget:widgets.IDomWidget,
			predicate:Function,
			current:Node = this.firstNode;
		for (; i < length; ++i) {
			widget = this._clauseWidgets[i];
			predicate = this._predicates[i];
			// if predicate exists test predicate, otherwise its the alternate clause
			if (predicate && predicate() || !predicate) {
				this.set('content', widget);
				return;
			}
		}
	}

}

export = DomConditional;
