/// <reference path="./dojo" />

declare module 'dijit/Calendar' {
	import CalendarLite = require('dijit/CalendarLite');
	import _Widget = require('dijit/_Widget');

	interface Calendar extends CalendarLite, _Widget {
	}

	var Calendar:{
		new (kwArgs?:Object, srcNodeRef?:HTMLElement):Calendar;
	};

	export = Calendar;
}

declare module 'dijit/CalendarLite' {
	import _WidgetBase = require('dijit/_WidgetBase');

	interface CalendarLite extends _WidgetBase {
	}

	var CalendarLite:{
		new (kwArgs?:Object, srcNodeRef?:HTMLElement):CalendarLite;
	};

	export = CalendarLite;
}

declare module 'dijit/CheckedMenuItem' {
	import MenuItem = require('dijit/MenuItem');

	interface CheckedMenuItem extends MenuItem {
	}

	var CheckedMenuItem:{
		new (kwArgs?:Object, srcNodeRef?:HTMLElement):CheckedMenuItem;
	};

	export = CheckedMenuItem;
}

declare module 'dijit/ColorPalette' {
	import _Widget = require('dijit/_Widget');

	interface ColorPalette extends _Widget {
	}

	var ColorPalette:{
		new (kwArgs?:Object, srcNodeRef?:HTMLElement):ColorPalette;
	};

	export = ColorPalette;
}

declare module 'dijit/_Contained' {
	import _WidgetBase = require('dijit/_WidgetBase');

	interface _Contained {
		getNextSibling():_WidgetBase;
		getPreviousSibling():_WidgetBase;
		getIndexInParent():_WidgetBase
	}

	var _Contained:{
	};

	export = _Contained;
}

declare module 'dijit/_Container' {
	import _WidgetBase = require('dijit/_WidgetBase');

	interface _Container {
		addChild(widget:_WidgetBase, insertIndex?:number):_WidgetBase;
		hasChildren():boolean;
		removeChild(widget:_WidgetBase):void;
		removeChild(index:number):void;
	}

	var _Container:{
	};

	export = _Container;
}

declare module 'dijit/Destroyable' {
	class Destroyable {
		own(destroyable:Destroyable):void;
		own(handle:IHandle):void;
	}
	export = Destroyable;
}

declare module 'dijit/Dialog' {
	import ContentPane = require('dijit/layout/ContentPane');

	interface Dialog extends ContentPane {
		show():IPromise<void>;
		hide():IPromise<void>;
	}

	var Dialog:{
		new (kwArgs?:Object, srcNodeRef?:HTMLElement):Dialog;
	};

	export = Dialog;
}

declare module 'dijit/DropDownMenu' {
	import _MenuBase = require('dijit/_MenuBase');

	interface DropDownMenu extends _MenuBase {
	}

	var DropDownMenu:{
		new (kwArgs?:Object, srcNodeRef?:HTMLElement):DropDownMenu;
	};

	export = DropDownMenu;
}

declare module 'dijit/_KeyNavContainer' {
	import _Container = require('dijit/_Container');

	interface _KeyNavContainer extends _Container {
	}

	var _KeyNavContainer:{
	};

	export = _KeyNavContainer;
}

declare module 'dijit/Menu' {
	import DropDownMenu = require('dijit/DropDownMenu');

	interface Menu extends DropDownMenu {
	}

	var Menu:{
		new (kwArgs?:Object, srcNodeRef?:HTMLElement):Menu;
	};

	export = Menu;
}

declare module 'dijit/MenuBar' {
	import _MenuBase = require('dijit/_MenuBase');

	interface MenuBar extends _MenuBase {
	}

	var MenuBar:{
		new (kwArgs?:Object, srcNodeRef?:HTMLElement):MenuBar;
	};

	export = MenuBar;
}

declare module 'dijit/MenuBarItem' {
	import MenuItem = require('dijit/MenuItem');

	interface MenuBarItem extends MenuItem {
	}

	var MenuBarItem:{
		new (kwArgs?:Object, srcNodeRef?:HTMLElement):MenuBarItem;
	};

	export = MenuBarItem;
}

declare module 'dijit/_MenuBase' {
	import _KeyNavContainer = require('dijit/_KeyNavContainer');
	import _Widget = require('dijit/_Widget');

	interface _MenuBase extends _Widget, _KeyNavContainer {
	}

	var _MenuBase:{
	};

	export = _MenuBase;
}

declare module 'dijit/MenuItem' {
	import _Contained = require('dijit/_Contained');
	import _Widget = require('dijit/_Widget');

	interface MenuItem extends _Widget, _Contained {
	}

	var MenuItem:{
		new (kwArgs?:Object, srcNodeRef?:HTMLElement):MenuItem;
	};

	export = MenuItem;
}

declare module 'dijit/MenuSeparator' {
	import _Contained = require('dijit/_Contained');
	import _WidgetBase = require('dijit/_WidgetBase');

	interface MenuSeparator extends _WidgetBase, _Contained {
	}

	var MenuSeparator:{
		new (kwArgs?:Object, srcNodeRef?:HTMLElement):MenuSeparator;
	};

	export = MenuSeparator;
}

declare module 'dijit/PopupMenuBarItem' {
	import PopupMenuItem = require('dijit/PopupMenuItem');

	interface PopupMenuBarItem extends PopupMenuItem {
	}

	var PopupMenuBarItem:{
		new (kwArgs?:Object, srcNodeRef?:HTMLElement):PopupMenuBarItem;
	};

	export = PopupMenuBarItem;
}

declare module 'dijit/PopupMenuItem' {
	import MenuItem = require('dijit/MenuItem');

	interface PopupMenuItem extends MenuItem {
	}

	var PopupMenuItem:{
		new (kwArgs?:Object, srcNodeRef?:HTMLElement):PopupMenuItem;
	};

	export = PopupMenuItem;
}

declare module 'dijit/ProgressBar' {
	import _Widget = require('dijit/_Widget');

	interface ProgressBar extends _Widget {
	}

	var ProgressBar:{
		new (kwArgs?:Object, srcNodeRef?:HTMLElement):ProgressBar;
	};

	export = ProgressBar;
}

declare module 'dijit/RadioMenuItem' {
	import CheckedMenuItem = require('dijit/CheckedMenuItem');

	interface RadioMenuItem extends CheckedMenuItem {
	}

	var RadioMenuItem:{
		new (kwArgs?:Object, srcNodeRef?:HTMLElement):RadioMenuItem;
	};

	export = RadioMenuItem;
}

declare module 'dijit/TitlePane' {
	import ContentPane = require('dijit/layout/ContentPane');

	interface TitlePane extends ContentPane {
	}

	var TitlePane:{
		new (kwArgs?:Object, srcNodeRef?:HTMLElement):TitlePane;
	};

	export = TitlePane;
}

declare module 'dijit/_Widget' {
	import _WidgetBase = require('dijit/_WidgetBase');

	interface _Widget extends _WidgetBase {
	}

	var _Widget:{
	};

	export = _Widget;
}

declare module 'dijit/_WidgetBase' {
	import Destroyable = require('dijit/Destroyable');
	import Evented = require('dojo/Evented');
	import Stateful = require('dojo/Stateful');

	interface _WidgetBase extends Stateful, Evented, Destroyable {
		/* readonly */ containerNode?:HTMLElement;
		/* readonly */ domNode:HTMLElement;
		/* readonly */ focusNode?:HTMLElement;

		new (kwArgs?:Object, srcNodeRef?:HTMLElement):_WidgetBase;

		get(key:'className'):string;
		get(key:'domNode'):HTMLElement;
		get(key:string):any;

		set(key:'className', value:string):void;
		set(kwArgs:{ [key:string]: any; }):void;
		set(key:string, value:any):void;

		destroy(preserveDom?:boolean):void;
		destroyDescendants(preserveDom?:boolean):void;
		destroyRecursive(preserveDom?:boolean):void;
		destroyRendering(preserveDom?:boolean):void;

		placeAt(referenceNode:HTMLElement, position:string):_WidgetBase;
		placeAt(referenceWidget:_WidgetBase, position:string):_WidgetBase;
		placeAt(referenceNode:HTMLElement, position:number):_WidgetBase;
		placeAt(referenceWidget:_WidgetBase, position:number):_WidgetBase;

		startup():void;
	}

	var _WidgetBase:{
		new (kwArgs?:Object, srcNodeRef?:HTMLElement):_WidgetBase;
	};

	export = _WidgetBase;
}

declare module 'dijit/form/Button' {
	import _FormWidget = require('dijit/form/_FormWidget');

	interface Button extends _FormWidget {
	}

	var Button:{
		new (kwArgs?:Object, srcNodeRef?:HTMLElement):Button;
	};

	export = Button;
}

declare module 'dijit/form/CheckBox' {
	import ToggleButton = require('dijit/form/ToggleButton');

	interface CheckBox extends ToggleButton {
	}

	var CheckBox:{
		new (kwArgs?:Object, srcNodeRef?:HTMLElement):CheckBox;
	};

	export = CheckBox;
}

declare module 'dijit/form/ComboBox' {
	import ValidationTextBox = require('dijit/form/ValidationTextBox');

	interface ComboBox extends ValidationTextBox {
	}

	var ComboBox:{
		new (kwArgs?:Object, srcNodeRef?:HTMLElement):ComboBox;
	};

	export = ComboBox;
}

declare module 'dijit/form/ComboButton' {
	import DropDownButton = require('dijit/form/DropDownButton');

	interface ComboButton extends DropDownButton {
	}

	var ComboButton:{
		new (kwArgs?:Object, srcNodeRef?:HTMLElement):ComboButton;
	};

	export = ComboButton;
}

declare module 'dijit/form/CurrencyTextBox' {
	import NumberTextBox = require('dijit/form/NumberTextBox');

	interface CurrencyTextBox extends NumberTextBox {
	}

	var CurrencyTextBox:{
		new (kwArgs?:Object, srcNodeRef?:HTMLElement):CurrencyTextBox;
	};

	export = CurrencyTextBox;
}

declare module 'dijit/form/DateTextBox' {
	import _DateTimeTextBox = require('dijit/form/_DateTimeTextBox');

	interface DateTextBox extends _DateTimeTextBox {
	}

	var DateTextBox:{
		new (kwArgs?:Object, srcNodeRef?:HTMLElement):DateTextBox;
	};

	export = DateTextBox;
}

declare module 'dijit/form/_DateTimeTextBox' {
	import RangeBoundTextBox = require('dijit/form/RangeBoundTextBox');

	interface _DateTimeTextBox extends RangeBoundTextBox {
	}

	var _DateTimeTextBox:{
		new (kwArgs?:Object, srcNodeRef?:HTMLElement):_DateTimeTextBox;
	};

	export = _DateTimeTextBox;
}

declare module 'dijit/form/DropDownButton' {
	import Button = require('dijit/form/Button');

	interface DropDownButton extends Button {
	}

	var DropDownButton:{
		new (kwArgs?:Object, srcNodeRef?:HTMLElement):DropDownButton;
	};

	export = DropDownButton;
}

declare module 'dijit/form/HorizontalSlider' {
	import _FormValueWidget = require('dijit/form/_FormValueWidget');

	interface HorizontalSlider extends _FormValueWidget {
	}

	export = HorizontalSlider;
}

declare module 'dijit/form/_FormValueWidget' {
	import _FormWidget = require('dijit/form/_FormWidget');

	interface _FormValueWidget extends _FormWidget {
	}

	export = _FormValueWidget;
}

declare module 'dijit/form/_FormWidget' {
	import _Widget = require('dijit/_Widget');

	interface _FormWidget extends _Widget {
	}

	export = _FormWidget;
}

declare module 'dijit/form/MappedTextBox' {
	import ValidationTextBox = require('dijit/form/ValidationTextBox');

	interface MappedTextBox extends ValidationTextBox {
	}

	var MappedTextBox:{
		new (kwArgs?:Object, srcNodeRef?:HTMLElement):MappedTextBox;
	};

	export = MappedTextBox;
}

declare module 'dijit/form/NumberSpinner' {
	import NumberTextBox = require('dijit/form/NumberTextBox');

	interface NumberSpinner extends NumberTextBox {
	}

	var NumberSpinner:{
		new (kwArgs?:Object, srcNodeRef?:HTMLElement):NumberSpinner;
	};

	export = NumberSpinner;
}

declare module 'dijit/form/NumberTextBox' {
	import RangeBoundTextBox = require('dijit/form/RangeBoundTextBox');

	interface NumberTextBox extends RangeBoundTextBox {
	}

	var NumberTextBox:{
		new (kwArgs?:Object, srcNodeRef?:HTMLElement):NumberTextBox;
	};

	export = NumberTextBox;
}

declare module 'dijit/form/RadioButton' {
	import CheckBox = require('dijit/form/CheckBox');

	interface RadioButton extends CheckBox {
	}

	var RadioButton:{
		new (kwArgs?:Object, srcNodeRef?:HTMLElement):RadioButton;
	};

	export = RadioButton;
}

declare module 'dijit/form/RangeBoundTextBox' {
	import MappedTextBox = require('dijit/form/MappedTextBox');

	interface RangeBoundTextBox extends MappedTextBox {
	}

	var RangeBoundTextBox:{
		new (kwArgs?:Object, srcNodeRef?:HTMLElement):RangeBoundTextBox;
	};

	export = RangeBoundTextBox;
}

declare module 'dijit/form/SimpleTextarea' {
	import TextBox = require('dijit/form/TextBox');

	interface SimpleTextarea extends TextBox {
	}

	var SimpleTextarea:{
		new (kwArgs?:Object, srcNodeRef?:HTMLElement):SimpleTextarea;
	};

	export = SimpleTextarea;
}

declare module 'dijit/form/Textarea' {
	import SimpleTextarea = require('dijit/form/SimpleTextarea');

	interface Textarea extends SimpleTextarea {
	}

	var Textarea:{
		new (kwArgs?:Object, srcNodeRef?:HTMLElement):Textarea;
	};

	export = Textarea;
}

declare module 'dijit/form/TextBox' {
	import _FormValueWidget = require('dijit/form/_FormValueWidget');

	interface TextBox extends _FormValueWidget {
		textbox:HTMLInputElement;
	}

	var TextBox:{
		new (kwArgs?:Object, srcNodeRef?:HTMLElement):TextBox;
	};

	export = TextBox;
}

declare module 'dijit/form/TimeTextBox' {
	import _DateTimeTextBox = require('dijit/form/_DateTimeTextBox');

	interface TimeTextBox extends _DateTimeTextBox {
	}

	var TimeTextBox:{
		new (kwArgs?:Object, srcNodeRef?:HTMLElement):TimeTextBox;
	};

	export = TimeTextBox;
}

declare module 'dijit/form/ToggleButton' {
	import Button = require('dijit/form/Button');

	interface ToggleButton extends Button {
	}

	var ToggleButton:{
		new (kwArgs?:Object, srcNodeRef?:HTMLElement):ToggleButton;
	};

	export = ToggleButton;
}

declare module 'dijit/form/ValidationTextBox' {
	import TextBox = require('dijit/form/TextBox');

	interface ValidationTextBox extends TextBox {
	}

	var ValidationTextBox:{
		new (kwArgs?:Object, srcNodeRef?:HTMLElement):ValidationTextBox;
	};

	export = ValidationTextBox;
}

declare module 'dijit/form/VerticalSlider' {
	import HorizontalSlider = require('dijit/form/HorizontalSlider');

	interface VerticalSlider extends HorizontalSlider {
	}

	export = VerticalSlider;
}

declare module 'dijit/layout/AccordionContainer' {
	import StackContainer = require('dijit/layout/StackContainer');

	interface AccordionContainer extends StackContainer {
	}

	var AccordionContainer:{
		new (kwArgs?:Object, srcNodeRef?:HTMLElement):AccordionContainer;
	};

	export = AccordionContainer;
}

declare module 'dijit/layout/BorderContainer' {
	import LayoutContainer = require('dijit/layout/LayoutContainer');

	interface BorderContainer extends LayoutContainer {
	}

	var BorderContainer:{
		new (kwArgs?:Object, srcNodeRef?:HTMLElement):BorderContainer;
	};

	export = BorderContainer;
}

declare module 'dijit/layout/ContentPane' {
	import _Container = require('dijit/_Container');
	import _Widget = require('dijit/_Widget');

	interface ContentPane extends _Widget, _Container {
	}

	var ContentPane:{
		new (kwArgs?:Object, srcNodeRef?:HTMLElement):ContentPane;
	};

	export = ContentPane;
}

declare module 'dijit/layout/LayoutContainer' {
	import _LayoutWidget = require('dijit/layout/_LayoutWidget');

	interface LayoutContainer extends _LayoutWidget {
	}

	var LayoutContainer:{
		new (kwArgs?:Object, srcNodeRef?:HTMLElement):LayoutContainer;
	};

	export = LayoutContainer;
}

declare module 'dijit/layout/_LayoutWidget' {
	import _Contained = require('dijit/_Contained');
	import _Container = require('dijit/_Container');
	import _Widget = require('dijit/_Widget');

	interface ContentPane extends _Widget, _Container, _Contained {
	}

	var ContentPane:{
		new (kwArgs?:Object, srcNodeRef?:HTMLElement):ContentPane;
	};

	export = ContentPane;
}

declare module 'dijit/layout/StackContainer' {
	import _LayoutWidget = require('dijit/layout/_LayoutWidget');

	interface StackContainer extends _LayoutWidget {
	}

	var StackContainer:{
		new (kwArgs?:Object, srcNodeRef?:HTMLElement):StackContainer;
	};

	export = StackContainer;
}

declare module 'dijit/layout/TabContainer' {
	import StackContainer = require('dijit/layout/StackContainer');

	interface TabContainer extends StackContainer {
	}

	var TabContainer:{
		new (kwArgs?:Object, srcNodeRef?:HTMLElement):TabContainer;
	};

	export = TabContainer;
}
