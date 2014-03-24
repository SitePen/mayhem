import core = require('../../../interfaces');
import dom = require('../interfaces');
import domConstruct = require('dojo/dom-construct');
import DomElementRenderer = require('../../dom/_Element');
import form = require('./interfaces');
import util = require('../../../util');

class ErrorRenderer extends DomElementRenderer {

	destroy(widget:form.IError):void {
		widget._observerHandle = util.remove(widget._observerHandle) && null;
		super.destroy(widget);
	}

	initialize(widget:form.IError):void {
		widget.observe('list', (list:core.IValidationError[], previous:core.IValidationError[]):void => {
			util.remove(widget._observerHandle);
			if (!list) {
				return this.clear(widget);
			}
			this._renderList(widget);
			// Observe error list if it's a new ObservableArray
			if (typeof list['observe'] === 'function' && list !== previous) {
				widget._observerHandle = list['observe'](():void => {
					this._renderList(widget);
				});
			}
		});
	}

	private _renderList(widget:form.IError):void {
		this.clear(widget);

		var fragment = document.createDocumentFragment(),
			list = widget.get('list') || [];
		for (var i = 0, error:core.IValidationError; (error = list[i]); i++) {
			var element = domConstruct.create('li', {}, fragment);
			element.appendChild(document.createTextNode(error.toString()));
		}
		widget._firstNode.appendChild(fragment);
	}
}

ErrorRenderer.prototype.elementType = 'ul';

export = ErrorRenderer;
