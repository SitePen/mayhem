import array = require('dojo/_base/array');
import core = require('../../../interfaces');
import domUtil = require('../../../ui/dom/util');
import Processor = require('../../html');
import Placeholder = require('./Placeholder');
import widgets = require('../../../ui/interfaces');

class Conditional extends Placeholder {
	private _clauseWidgets:widgets.IDomWidget[];
	private _observerMap:IHandle[]; // TODO: clean up
	private _predicateTerms:Array<string[]>;

	constructor(kwArgs:any) {
		this._predicateTerms = [];
		this._clauseWidgets = [];
		this._observerMap = [];

		var conditions = kwArgs.conditions;
		delete kwArgs.conditions;
		var alternate = kwArgs.alternate;
		delete kwArgs.alternate;

		super(kwArgs);

		var mediator = this.get('mediator');

		// Instantiate all conditional widgets, and alternate, regardless of predicate status
		if (conditions) {
			array.forEach(conditions, (condition:any, i:number) => {
				this._clauseWidgets.push(Processor.widgetFromAst(condition.content, this.app, mediator, this));
				this._interpretCondition(condition.condition, i);
			});
		}
		if (alternate) {
			this._clauseWidgets.push(Processor.widgetFromAst(alternate, this.app, mediator, this));
		}

		this._evaluateConditions();
	}

	// Evaluate predicate condition and switch currently attached widget if necessary
	private _evaluateConditions():void {
		// TODO use debounce in util
		var i:number,
			length:number,
			widget:widgets.IDomWidget,
			terms:string[],
			success:boolean,
			current:Node = this.firstNode;
		for (i = 0, length = this._clauseWidgets.length; i < length; ++i) {
			widget = this._clauseWidgets[i];
			terms = this._predicateTerms[i];
			success = terms && eval(terms.join(''));
			// Evaluate predicate terms if they exist, otherwise its the alternate clause
			if (success || !terms) {
				this.content !== widget && this.set('content', widget);
				return;
			}
		}
	}

	// Interprets binding in conditional heads and set up watchers
	private _interpretCondition(condition:any[], predicateIndex:number):void {
		var mediator:core.IMediator = this.get('mediator');
		var terms:string[] = [];
		array.forEach(condition, (term:any, i:number) => {
			var field:string = term.binding;
			if (!field) {
				terms[i] = term.toString();
				return;
			}
			this._observerMap[field] = mediator.observe(field, (newValue:any) => {
				terms[i] = JSON.stringify(newValue);
				this._evaluateConditions();
			});
			// TODO: prob not necessary w/ debounce
			terms[i] = JSON.stringify(mediator.get(field));
		});
		this._predicateTerms[predicateIndex] = terms;
	}

}

export = Conditional;
