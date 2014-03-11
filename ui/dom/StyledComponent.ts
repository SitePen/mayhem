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

		widget.set('_classListHandle', widget.get('classList').observe((className:string):void => {
			widget.get('firstNode').className = className;
		}));

		widget.set('_styleHandle', widget.get('style').observe((newValue:style.IStyle, oldValue:style.IStyle, key:string):void => {
			if (has('debug') && key.indexOf('-') !== -1) {
				throw new Error('CSS properties in JavaScript are camelCase, not hyphenated');
			}

			domUtil.setStyle(widget.get('firstNode'), key, newValue);
		}));
	}

	destroy(widget:dom.IElement):void {
		this.detachStyles(widget);
		widget.set({
			classListHandle: null,
			styleHandle: null
		});
		super.destroy(widget);
	}

	detachStyles(widget:dom.IElement):void {
		var classListHandle = widget.get('_classListHandle'),
			styleHandle = widget.get('_styleHandle');
		classListHandle && classListHandle.remove();
		styleHandle && styleHandle.remove();
	}

	render(widget:dom.IElement, options:dom.IRenderOptions = {}):void {
		super.render(widget, options);
		var classList = new ClassList();
		var fragment = <HTMLElement> options.fragment;
		if (fragment) {
			classList.set(fragment.className);
		}
		widget.set('classList', classList);
		widget.set('style', new Style());
		this.attachStyles(widget);
	}
}

export = StyledComponentRenderer;
