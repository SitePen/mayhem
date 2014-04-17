/// <reference path="../../dojo" />

import aria = require('./util/aria');
import array = require('dojo/_base/array');
import dom = require('./interfaces');
import keys = require('./util/keys');
import has = require('../../has');
import on = require('dojo/on');
import touch = require('dojo/touch');
import util = require('../../util');

export class Base implements dom.IActionConfig {
	name:string;
	role:string;
	triggers:any[];

	attach(widget:dom.IElementWidget):IHandle {
		var name = this.name;
		!name && has('debug') && console.warn('Action config must have a name property');
		
		var handles = array.map(this.triggers || [], (trigger:any):IHandle => {
			return on(widget._outerFragment, trigger, (event:Event):void => {
				widget.trigger(name, event);
			});
		});

		return {
			remove: function():void {
				this.remove = function():void {};
				util.remove.apply(null, handles);
				widget = handles = null;
			}
		}
	}

	invoke(widget:dom.IElementWidget):void {
		widget.emit('action:' + this.name);
	}
}


export class Press extends Base {
	attach(widget:dom.IElementWidget):IHandle {
		!this.role && has('debug') && console.warn('Action config must have a role property');

		var superHandle = super.attach(widget),
			stateName = aria.getStateName(this.role, 'selected'),
			observerHandle = widget.observe('selected', (value:boolean) => {
				aria.setState(widget._outerFragment, stateName, value);
				// TODO: this belongs on the widget
				widget.classList.toggle('selected', value);
			});

		return {
			remove: function():void {
				this.remove = function():void {};
				observerHandle.remove();
				superHandle.remove();
				widget._outerFragment.removeAttribute(stateName);
				widget = observerHandle = superHandle = null;
			}
		};
	}
}

Press.prototype.name = 'press';
Press.prototype.triggers = [ touch.press ];

export class CheckboxPress extends Press {
	invoke(widget:dom.IElementWidget):void {
		widget.set('selected', !widget.get('selected'));
		super.invoke(widget);
	}
}

CheckboxPress.prototype.role = 'checkbox';
CheckboxPress.prototype.triggers = CheckboxPress.prototype.triggers.concat(keys.press('ENTER'));

export class RadioPress extends CheckboxPress {
	invoke(widget:dom.IElementWidget):void {
		widget.get('selected') || widget.set('selected', true);
	}
}

RadioPress.prototype.role = 'radio';

export class LinkPress extends Press {
	invoke(widget:dom.IElementWidget):void {
		var href = widget.get('href');
		if (typeof href === 'string') {
			window.location.href = href;
		}
		else if (href && typeof href.history === 'number') {
			// TODO: think this through
			window.history.go(href.history);
		}
		super.invoke(widget);
	}
}

LinkPress.prototype.role = 'link';
LinkPress.prototype.triggers = LinkPress.prototype.triggers.concat(keys.press('SPACE'));

export class ButtonPress extends LinkPress {
	invoke(widget:dom.IElementWidget):void {
		// Widget behaves like a toggle button if it has "selected" state defined
		var selected = widget.get('selected');
		if (selected !== undefined) {
			widget.set('selected', !selected);
		}
		super.invoke(widget);
	}
}

ButtonPress.prototype.role = 'button';
ButtonPress.prototype.triggers = ButtonPress.prototype.triggers.concat(keys.press('ENTER'));

export class DialogDismiss extends Base {
	invoke(widget:dom.IElementWidget):void {
		widget.get('hidden') || widget.set('hidden', true);
		super.invoke(widget);
	}
}

DialogDismiss.prototype.name = 'dismiss';
DialogDismiss.prototype.role = 'dialog';
DialogDismiss.prototype.triggers = [ keys.press('ESCAPE') /*, TODO: any non-target click */ ];

export class DialogOpen extends Base {
	invoke(widget:dom.IElementWidget):void {
		widget.get('hidden') && widget.set('hidden', false);
		super.invoke(widget);
	}
}

DialogOpen.prototype.name = 'open';
DialogOpen.prototype.role = 'dialog';