import ClassList = require('../style/ClassList');
import ComponentRenderer = require('./Component');
import dom = require('./interfaces');
import domUtil = require('./util');
import has = require('../../has');
import style = require('../style/interfaces');
import Style = require('../style/Style');

class StyledComponentRenderer extends ComponentRenderer {

	attachStyles(widget:dom.IElement):void {
		this.detachStyles(widget);

		widget._classListHandle = widget.classList.observe((className:string):void => {
			widget.get('firstNode').className = className;
		});

		widget._styleHandle = widget.style.observe((newValue:style.IStyle, oldValue:style.IStyle, key:string):void => {
			if (has('debug') && key.indexOf('-') !== -1) {
				throw new Error('CSS properties in JavaScript are camelCase, not hyphenated');
			}

			domUtil.setStyle(widget.get('firstNode'), key, newValue);
		});
	}

	destroy(widget:dom.IElement):void {
		this.detachStyles(widget);
		widget._classListHandle = null;
		widget._styleHandle = null;
		super.destroy(widget);
	}

	detachStyles(widget:dom.IElement):void {
		widget._classListHandle && widget._classListHandle.remove();
		widget._styleHandle && widget._styleHandle.remove();
	}

	initialize(widget:dom.IElement):void {
		widget.classList = new ClassList();
		widget.style = new Style();
		super.initialize(widget);
	}

	render(widget:dom.IElement, options:dom.IRenderOptions = {}):void {
		super.render(widget, options);
		this.attachStyles(widget);
	}
}

export = StyledComponentRenderer;
