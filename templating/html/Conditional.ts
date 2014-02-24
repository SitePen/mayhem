import array = require('dojo/_base/array');
import core = require('../../interfaces');
import DomPlaceholder = require('../../ui/dom/Placeholder');
import domUtil = require('../../ui/dom/util');
import processor = require('../html');
import ui = require('../../ui/interfaces');
import util = require('../../util');

class Conditional extends DomPlaceholder {
	private _alternateWidget:ui.IDomWidget;
	private _conditionHandles:IHandle[];
	private _conditions:any;
	private _conditionWidgets:ui.IDomWidget[];
	private _evaluateConditions:Function;

	constructor(kwArgs:any) {
		util.deferMethods(this, [ '_updateBinding' ], '_activeMediatorSetter');
		this._evaluateConditions = util.debounce(this.__evaluateConditions);
		super(kwArgs);
	}

	/* protected */ _activeMediatorSetter(value:core.IMediator):void {
		super._activeMediatorSetter(value);
		this._updateBinding();
	}

	private _alternateSetter(alternate:any):void {
		this._alternateWidget = processor.constructWidget(alternate, this);
	}

	private _clearConditionHandles():void {
		var handles:IHandle[] = this._conditionHandles || [];
		for (var i = 0, length = handles.length; i < length; ++i) {
			handles[i].remove();
		}
		this._conditionHandles = null;
	}

	private _conditionsSetter(conditions:any):void { // TODO: IConditionsNode?
		this._conditionWidgets = [];
		this._conditions = conditions;
		for (var i = 0, length = conditions.length; i < length; ++i) {
			this._conditionWidgets[i] = processor.constructWidget(conditions[i].content, this);
		}
		this._updateBinding();
	}

	destroy():void {
		this._clearConditionHandles();
		array.forEach(this._conditionWidgets || [], (widget:ui.IDomWidget):void => widget.destroy());
		this._alternateWidget && this._alternateWidget.destroy();

		this._conditions = null;
		this._alternateWidget = this._conditionWidgets = null;

		super.destroy();
	}

	// Evaluate predicate condition and switch currently attached widget if necessary
	private __evaluateConditions():void {
		var mediator:core.IMediator = this.get('mediator'),
			bindingFields:string[] = this._getBindingFields();
		for (var i = 0, length = bindingFields.length; i < length; ++i) {
			if (mediator.get(bindingFields[i])) {
				this.set('content', this._conditionWidgets[i]);
				return;
			}
		}
		// Set content to alternate widget (or nothing at all)
		this.set('content', this._alternateWidget);
	}

	private _getBindingFields():string[] {
		var fields:string[] = [],
			condition:any;
		for (var i = 0; (condition = this._conditions[i]); ++i) {
			fields.push(condition.condition);
		};
		return fields;
	}

	private _updateBinding():void {
		this._clearConditionHandles();
		this._conditionHandles = [];

		var mediator:core.IMediator = this.get('mediator');
		array.forEach(this._getBindingFields(), (field:string, i:number):void => {
			this._conditionHandles[i] = mediator.observe(field, this._evaluateConditions(this));
		});
		this._evaluateConditions();
	}
}

export = Conditional;
