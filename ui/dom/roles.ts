import actions = require('./actions');
import lang = require('dojo/_base/lang');

var focusable = { focus: new actions.Focus(), blur: new actions.Blur() };

export var button = lang.mixin({ press: new actions.ButtonPress() }, focusable);
export var checkbox = lang.mixin({ press: new actions.CheckboxPress() }, focusable);
export var dialog = lang.mixin({ dismiss: new actions.DialogDismiss(), show: new actions.DialogShow() }, focusable);
export var link = lang.mixin({ press: new actions.LinkPress() }, focusable);
export var radio = lang.mixin({ press: new actions.RadioPress() }, focusable);
