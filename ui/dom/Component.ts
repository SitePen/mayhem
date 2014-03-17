import BaseRenderer = require('./Base');
import dom = require('./interfaces');

class ComponentRenderer extends BaseRenderer {
	add(widget:dom.IContainer, item:dom.IWidget, referenceItem:dom.IWidget, position:any):void {
		var firstNode:Node = widget.get('firstNode'),
			referenceNode:Node = referenceItem && referenceItem.get('firstNode'),
			itemNode:Node = item.get('fragment');

		firstNode.insertBefore(itemNode, referenceNode);
	}

	clear(widget:dom.IElement):void {
		widget.get('firstNode').innerHTML = '';
	}

	detach(widget:dom.IWidget):void {
		var firstNode = widget.get('firstNode');
		// TODO: Make sure this is a reasonably logical thing to do; it introduces an inconsistency where
		// the widget is still parented in the widget tree but not in the DOM tree.
		firstNode.parentNode && firstNode.parentNode.removeChild(firstNode);
	}

	getTextContent(widget:dom.IComposite):string {
		var firstNode = <HTMLElement> widget.get('firstNode');
		// TODO: has-branch for old IE?
		return firstNode.textContent || firstNode.innerText;
	}

	remove(widget:dom.IContainer, item:dom.IWidget):void {
		var firstNode:Node = <any>item.get('firstNode');

		firstNode.parentNode && firstNode.parentNode.removeChild(firstNode);
	}

	render(widget:dom.IWidget, options:dom.IRenderOptions = {}):void {
		// Use provided root element or create one
		var newRoot = <HTMLElement> options.fragment || document.createElement(options.elementType || 'div');
		// If widget is already attached to a parent swap out the new widget
		var oldRoot = widget.get('fragment');
		if (oldRoot && oldRoot.parentNode) {
			oldRoot.parentNode.replaceChild(newRoot, oldRoot);
		}
		widget.set({
			firstNode: newRoot,
			lastNode: newRoot,
			fragment: newRoot
		});
	}

	setAttribute(widget:dom.IElement, name:string, value:string):void {
		widget.get('firstNode').setAttribute(name, value);
	}

	setBody(widget:dom.IElement, body?:any /* string | Node */):void {
		if (typeof body === 'string') {
			widget.get('firstNode').innerHTML = body;
		}
		else {
			this.clear(widget);
			body && widget.get('firstNode').appendChild(body);
		}
	}
}

export = ComponentRenderer;
