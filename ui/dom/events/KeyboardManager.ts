import domUtil = require('../util');
import has = require('../../../has');
import lang = require('dojo/_base/lang');
import util = require('../../../util');

interface Dom3KeyboardEvent extends KeyboardEvent {
	// TODO: This is in DOM3 drafts but not implemented in most browsers
	code:string;
	isComposing:boolean;
}

interface WebKitKeyboardEvent extends Dom3KeyboardEvent {
	keyIdentifier:string;
}

if (!has('dom-keyboard-key') && !has('dom-keyboard-keyIdentifier')) {
	var KEYS = (function ():HashMap<string> {
		var jp:boolean = (navigator.language || navigator.userLanguage) === 'ja';
		return {
			3: 'Break',
			8: 'Backspace',
			9: 'Tab',
			12: '=',
			13: 'Enter',
			16: 'Shift',
			17: 'Control',
			18: 'Alt',
			19: 'Pause',
			20: 'CapsLock',
			27: 'Escape',
			32: ' ',
			33: 'PageUp',
			34: 'PageDown',
			35: 'End',
			36: 'Home',
			37: 'ArrowLeft',
			38: 'ArrowUp',
			39: 'ArrowRight',
			40: 'ArrowDown',
			44: 'PrintScreen',
			45: 'Insert',
			46: 'Delete',
			48: '0',
			'48Shift': '!',
			49: '1',
			'49Shift': '@',
			50: '2',
			'50Shift': '#',
			51: '3',
			'51Shift': '$',
			52: '4',
			'52Shift': '%',
			53: '5',
			'53Shift': '^',
			54: '6',
			'54Shift': '&',
			55: '7',
			'55Shift': '*',
			56: '8',
			'56Shift': '(',
			57: '9',
			'57Shift': ')',
			59: ';',
			'59Shift': ':',
			61: '=',
			'61Shift': '+',
			91: 'OS',
			92: 'OS',
			93: 'ContextMenu',
			96: '0',
			97: '1',
			98: '2',
			99: '3',
			100: '4',
			101: '5',
			102: '6',
			103: '7',
			104: '8',
			105: '9',
			106: '*',
			107: '+',
			109: '-',
			110: '.',
			111: '/',
			112: 'F1',
			113: 'F2',
			114: 'F3',
			115: 'F4',
			116: 'F5',
			117: 'F6',
			118: 'F7',
			119: 'F8',
			120: 'F9',
			121: 'F10',
			122: 'F11',
			123: 'F12',
			124: 'F13',
			125: 'F14',
			126: 'F15',
			127: 'F16',
			128: 'F17',
			129: 'F18',
			130: 'F19',
			131: 'F20',
			132: 'F21',
			133: 'F22',
			134: 'F23',
			135: 'F24',
			144: 'NumLock',
			145: 'ScrollLock',
			173: '-',
			'173Shift': '_',
			182: 'LaunchMyComputer',
			183: 'LaunchCalclator',
			186: jp ? '\'' : ';',
			'186Shift': jp ? '"' : ':',
			187: jp ? ';' : '=',
			'187Shift': jp ? ':' : '+',
			188: ',',
			'188Shift': '<',
			189: '-',
			'189Shift': '_',
			190: '.',
			'190Shift': '>',
			191: '/',
			'191Shift': '?',
			192: jp ? '[' : '`',
			'192Shift': jp ? '{' : '~',
			193: 'IntlRo',
			194: ',',
			219: jp ? ']' : '[',
			'219Shift': jp ? '}' : '{',
			220: jp ? '¥' : '\\',
			'220Shift': '|',
			221: jp ? '\\' : ']',
			'221Shift': jp ? '\\' : '}',
			222: jp ? '=' : '\'',
			'222Shift': jp ? '+' : '"',
			224: 'Meta',
			225: 'AltGraph',
			226: 'IntlRo',
			255: '¥'
		};
	})();

	var keyCodeToKey = function (keyCode:number, shiftKey:boolean):string {
		if (/* A-Z */ keyCode >= 65 && keyCode <= 90) {
			return String.fromCharCode(keyCode + (shiftKey ? 0 : 32));
		}
		else if (keyCode in KEYS) {
			return KEYS[keyCode + (shiftKey ? 'Shift' : '')] || KEYS[keyCode];
		}
		else {
			return 'Unidentified';
		}
	};
}

if (!has('dom-keyboard-code')) {
	var CODES = (function () {
		var jp:boolean = (navigator.language || navigator.userLanguage) === 'ja';
		var codes:HashMap<string> = {
			3: 'Pause',
			8: 'Backspace',
			9: 'Tab',
			12: 'NumpadEqual',
			13: 'Enter',
			16: 'ShiftLeft',
			17: 'ControlLeft',
			18: 'AltLeft',
			19: 'Pause',
			20: 'CapsLock',
			27: 'Escape',
			32: 'Space',
			33: 'PageUp',
			34: 'PageDown',
			35: 'End',
			36: 'Home',
			37: 'ArrowLeft',
			38: 'ArrowUp',
			39: 'ArrowRight',
			40: 'ArrowDown',
			44: 'PrintScreen',
			45: 'Insert',
			46: 'Delete',
			48: 'Digit0',
			49: 'Digit1',
			50: 'Digit2',
			51: 'Digit3',
			52: 'Digit4',
			53: 'Digit5',
			54: 'Digit6',
			55: 'Digit7',
			56: 'Digit8',
			57: 'Digit9',
			59: 'Semicolon',
			61: 'Equal',
			91: 'OSLeft',
			92: 'OSRight',
			93: 'ContextMenu',
			96: 'Numpad0',
			97: 'Numpad1',
			98: 'Numpad2',
			99: 'Numpad3',
			100: 'Numpad4',
			101: 'Numpad5',
			102: 'Numpad6',
			103: 'Numpad7',
			104: 'Numpad8',
			105: 'Numpad9',
			106: 'NumpadMultiply',
			107: 'NumpadAdd',
			109: 'NumpadSubtract',
			110: 'NumpadDecimal',
			111: 'NumpadDivide',
			112: 'F1',
			113: 'F2',
			114: 'F3',
			115: 'F4',
			116: 'F5',
			117: 'F6',
			118: 'F7',
			119: 'F8',
			120: 'F9',
			121: 'F10',
			122: 'F11',
			123: 'F12',
			124: 'F13',
			125: 'F14',
			126: 'F15',
			127: 'F16',
			128: 'F17',
			129: 'F18',
			130: 'F19',
			131: 'F20',
			132: 'F21',
			133: 'F22',
			134: 'F23',
			135: 'F24',
			144: 'NumLock',
			145: 'ScrollLock',
			173: 'Minus',
			182: 'LaunchApp1',
			183: 'LaunchApp2',
			186: jp ? 'Quote' : 'Semicolon',
			187: jp ? 'Semicolon' : 'Equal',
			188: 'Comma',
			189: 'Minus',
			190: 'Period',
			191: 'Slash',
			192: jp ? 'BracketLeft' : 'Backquote',
			193: 'IntlRo',
			194: 'NumpadComma',
			219: jp ? 'BracketRight' : 'BracketLeft',
			220: jp ? 'IntlYen' : 'Backslash',
			221: jp ? 'Backslash' : 'BracketRight',
			222: jp ? 'Equal' : 'Quote',
			224: 'OSLeft',
			225: 'AltGraph',
			226: 'IntlRo',
			255: 'IntlYen'
		};

		for (var i:number = /* A */ 65; i <= /* Z */ 90; ++i) {
			codes[i] = 'Key' + String.fromCharCode(i);
		}

		return codes;
	})();
}

class KeyboardManager {
	private _handles:IHandle[] = [];
	private _listeners:{ [type:string]:KeyboardManager.Listener[]; };
	private _root:Element;

	constructor(root:EventTarget) {
		var handles:IHandle[] = this._handles = [];
		this._listeners = {};
		this._root = <Element> root;

		handles.push(
			domUtil.on(window, 'keydown', lang.hitch(this, '_emit', 'down')),
			domUtil.on(window, 'keypress', lang.hitch(this, '_emit', 'repeat')),
			domUtil.on(window, 'keyup', lang.hitch(this, '_emit', 'up')),
			domUtil.on(window, 'compositionend', lang.hitch(this, '_emit', 'up'))
		);
	}

	private _createKeyInfo(event:KeyboardEvent):KeyboardManager.KeyInfo {
		var keyInfo:KeyboardManager.KeyInfo = <any> {};

		if (has('dom-keyboard-key')) {
			keyInfo.char = event.char;
			keyInfo.key = event.key;
		}
		else if (has('dom-keyboard-keyIdentifier')) {
			if ((<WebKitKeyboardEvent> event).keyIdentifier.indexOf('U+') === 0) {
				keyInfo.char = keyInfo.key = String.fromCharCode(Number('0x' + (<WebKitKeyboardEvent> event).keyIdentifier.slice(2)));
			}
			else {
				keyInfo.char = '';
				keyInfo.key = (<WebKitKeyboardEvent> event).keyIdentifier;
			}
		}
		else {
			keyInfo.key = keyCodeToKey(event.keyCode, event.shiftKey);
			keyInfo.char = keyInfo.key.length === 1 ? keyInfo.key : '';
		}

		if (has('dom-keyboard-code')) {
			keyInfo.code = (<Dom3KeyboardEvent> event).code;
		}
		else {
			keyInfo.code = CODES[event.keyCode] || 'Unidentified';
		}

		return keyInfo;
	}

	destroy():void {
		this.destroy = function ():void {};
		var handle:IHandle;
		while ((handle = this._handles.pop())) {
			handle.remove();
		}
		this._handles = this._listeners = null;
	}

	private _emit(type:string, event:KeyboardEvent):void {
		var listeners:KeyboardManager.Listener[] = this._listeners[type];
		if (
			!listeners ||
			(<Dom3KeyboardEvent> event).isComposing ||
			(
				document.activeElement !== document.body &&
				document.activeElement !== this._root &&
				!(<HTMLElement> this._root).contains(<HTMLElement> document.activeElement)
			)
		) {
			return;
		}

		var keyInfo:KeyboardManager.KeyInfo = this._createKeyInfo(event);

		for (var i:number = 0, listener:KeyboardManager.Listener; (listener = listeners[i]); ++i) {
			if (listener.call(this, keyInfo)) {
				event.preventDefault();
			}
		}
	}

	// observing widgets for `value` changes is the correct approach when looking for input; using standalone key events
	// is only for performing actions literally in response to key events
	on(type:'down', listener:KeyboardManager.Listener):IHandle;
	on(type:'repeat', listener:KeyboardManager.Listener):IHandle;
	on(type:'up', listener:KeyboardManager.Listener):IHandle;
	on(type:string, listener:KeyboardManager.Listener):void;
	on(type:string, listener:KeyboardManager.Listener):IHandle {
		var listeners:KeyboardManager.Listener[] = this._listeners[type];
		if (!listeners) {
			listeners = this._listeners[type] = [];
		}

		listeners.push(listener);
		return util.createHandle(function () {
			util.spliceMatch(listeners, listener);
			listeners = listener = null;
		});
	}
}

module KeyboardManager {
	export interface Listener {
		(keyInfo:KeyboardManager.KeyInfo):boolean;
	}

	export interface KeyInfo {
		char:string;
		code:string;
		key:string;
	}
}

export = KeyboardManager;
