import widgets = require('../interfaces');
import DomPlaceholder = require('./Placeholder');
import Element = require('./Element');
import domUtil = require('./util');

// TODO: extend Placeholder?
class DomConditional extends DomPlaceholder {

	private static eval(condition:any):Function {
		// TODO: bindings and whatnot
		return function() {
			return eval(condition.join(''));
		}
	}

	private _predicates:Function[] = []; // array of predicates
	private _clauses:widgets.IDomWidget[] = [];

	content:widgets.IWidget;

	constructor(kwArgs:any) {
		super(kwArgs);

		// instantiate all conditional widgets, and alternate, regardless of predicate status
		kwArgs.conditions && kwArgs.conditions.forEach(function(condition:any) { // FIXME es5
			this._predicates.push(DomConditional.eval(condition.condition));
			this._addClause(condition.content);
		}, this);
		if (kwArgs.alternate) {
			this._addClause(kwArgs.alternate);
		}
		this._refresh();
	}

	private _addClause(options:any) {
		// TODO: look up deps
		options.app = this.app;
		options.mediator = this.mediator;
		this._clauses.push(new Element(options));
	}

	// evaluate predicate condition and switch currently attached widget if necessary
	private _refresh():void {
		var i:number = 0,
			length:number = this._clauses.length,
			child:widgets.IDomWidget,
			predicate:Function,
			current:Node = this.firstNode;
		for (; i < length; ++i) {
			child = this._clauses[i];
			predicate = this._predicates[i];
			// if predicate exists test predicate, otherwise its the alternate clause
			if (predicate && predicate() || !predicate) {
				///this.firstNode = child.firstNode;
				//var fragment = domUtil.getRange(this.firstNode, this.lastNode, true).extractContents()
				current.parentNode.replaceChild(child.firstNode, current);
				return;
			}
		}
		///this.firstNode = document.createTextNode('conditional ' + this.id);
		///current.parentNode.replaceChild(child.firstNode, current);
	}

}

export = DomConditional;
