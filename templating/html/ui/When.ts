import data = require('../../../data/interfaces');
import domUtil = require('../../../ui/dom/util');
import WidgetFactory = require('../../WidgetFactory');
import Mediator = require('../../../data/Mediator');
import templating = require('./interfaces');
import ui = require('../../../ui/interfaces');
import util = require('../../../util');
import View = require('../../../ui/View');
import when = require('dojo/when');

// TODO: move all this render noise to the renderer
class When extends View implements templating.IWhen {
	private _duringTemplate:any;
	private _duringWidget:ui.IWidget;
	private _errorTemplate:any;
	private _errorWidget:ui.IWidget;
	private _hasProgress:boolean;
	private _inFlight:boolean;
	private _mediatorHandle:IHandle;
	private _originalMediator:data.IMediator;
	private _promiseField:string;
	private _promiseFieldHandle:IHandle;
	private _promiseValue:any;
	private _scopedMediator:Mediator;
	private _success:boolean;
	private _targetPromise:any;
	/* protected */ _values:any;
	private _valueField:string;

	get:templating.IWhenGet;
	set:templating.IWhenSet;

	constructor(kwArgs:any = {}) {
		util.deferSetters(this, [ 'content' ], '_targetPromiseSetter');
		super(kwArgs);
		this._mediatorHandle = this.observe('mediator', (mediator:data.IMediator) => {
			mediator && this._scopeMediator(mediator);
		});
		kwArgs.mediator && this._scopeMediator(kwArgs.mediator);
	}

	/* protected */ _contentSetter(content:Node):void {
		this._values.content = content;
		// Defer content render unless we've already resolved succesfully
		if (this._success) {
			this._renderSuccess();
		}
	}

	private _createScopedMediator(mediator:data.IMediator):Mediator {
		var scopedMediator:Mediator = new Mediator({ model: mediator }),
			_get = scopedMediator.get,
			_set = scopedMediator.set;
		scopedMediator.get = (field:string):any => {
			if (field !== this._valueField) {
				return _get.call(scopedMediator, field);
			}
			return this._promiseValue;
		}
		scopedMediator.set = (field:string, value:any):void => {
			if (field !== this._valueField) {
				return _set.call(scopedMediator, field, value);
			}
			var oldValue:any = this._promiseValue;
			this.set('promiseValue', value);
		};
		return scopedMediator;
	}

	private _createWidget(template:any):ui.IWidget {
		if (template) {
			var widget = new WidgetFactory(template, View).create();
			this.attach(widget);
			return widget;
		}
	}

	destroy():void {
		// TODO cancel this._targetPromise?
		this._promiseFieldHandle && this._promiseFieldHandle.remove();
		this._promiseFieldHandle = this._targetPromise = null;
		this._errorWidget.destroy();
		this._duringWidget.destroy();
		this._errorWidget = this._duringWidget = this._promiseValue = null;
		this._mediatorHandle && this._mediatorHandle.remove();
		this._mediatorHandle = null;
		this._values.mediator && this._values.mediator.destroy();
		this._values.mediator = this._originalMediator = null;
		super.destroy();
	}

	private _duringSetter(template:any):void {
		this._duringTemplate = template;
		this._duringWidget = this._createWidget(template);
	}

	private _errorSetter(template:any):void {
		this._errorTemplate = template;
		this._errorWidget = this._createWidget(template);
	}

	private _promiseSetter(field:string):void {
		this._promiseField = field;
		this._promiseFieldHandle && this._promiseFieldHandle.remove();
		if (this._values.mediator) {
			this._promiseFieldHandle = this._values.mediator.observe(field, (promise:any) => {
				this._targetPromiseSetter(promise);
			});
			this._targetPromiseSetter(this._values.mediator.get(field));
		}
	}

	private _promiseValueSetter(value:any):void {
		var oldValue = this._promiseValue;
		this._promiseValue = value;
		this._values.mediator._notify(value, oldValue, this._valueField);
	}

	private _scopeMediator(mediator:data.IMediator):void {
		this._originalMediator = mediator;
		this._values.mediator && this._values.mediator.destroy();
		this._values.mediator = this._createScopedMediator(mediator);
		// Call promise setter again to get a new promise field observer
		this._promiseSetter(this._promiseField);
	}

	private _renderDuring():void {
		this._errorWidget && this._errorWidget.detach();
		var node:Node;
		if (this._duringWidget) {
			this._duringWidget.detach();
			node = this._duringWidget.get('fragment');
		}
		var lastNode = this.get('lastNode');
		// Preserve content if previously rendered
		if (!this._values.content) {
			this._values.content = domUtil.getRange(this.get('firstNode'), lastNode, true).extractContents();
		}
		node && lastNode.parentNode.insertBefore(node, lastNode);
	}

	private _renderError():void {
		this._duringWidget && this._duringWidget.detach();
		if (this._errorWidget) {
			this._errorWidget.detach();
			// TODO: move to the renderer
			var lastNode = this.get('lastNode');
			lastNode.parentNode.insertBefore(this._errorWidget.get('fragment'), lastNode);
		}
	}

	private _renderSuccess():void {
		this._duringWidget && this._duringWidget.detach();
		//this._renderContent();
		// this._renderer.setBody...
	}

	private _targetPromiseSetter(value:any):void {
		// Bail if we've already processed a value and this is the same one
		if (this._success !== undefined && value === this._targetPromise) {
			return;
		}
		// Bail if we've already successfully processed a value and new value isn't a promise
		if (this._success && typeof value.then !== 'function') {
			return;
		}
		// Bail if we're currently processing a value
		// TODO: how should we handle this? cancel previous promise? throw?
		if (this._inFlight) {
			return;
		}
		this._targetPromise = value;
		this._hasProgress = false;
		this._inFlight = true;
		this._promiseValue = undefined;
		this._success = null;
		
		this._renderDuring();
		when(value).then((value:any):void => {
			this._success = true;
			this.set('promiseValue', value);
			// TODO: detach error or progress?
			this._renderSuccess();
		}, (error:Error):void => {
			this._success = false;
			this.set('promiseValue', error);
			this._renderError();
		}, (progress:any):void => {
			this._hasProgress || (this._hasProgress = true);
			this.set('promiseValue', progress);
		}).then(():void => {
			this._inFlight = false;
		});
	}

	private _valueSetter(field:string):void {
		this._valueField = field;
		// TODO: rewire mediator
	}
}

export = When;
