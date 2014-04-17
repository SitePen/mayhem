import actions = require('./actions');

export var button = { press: new actions.ButtonPress() };
export var checkbox = { press: new actions.CheckboxPress() };
export var dialog = { dismiss: new actions.DialogDismiss(), open: new actions.DialogOpen() };
export var link = { press: new actions.LinkPress() };
export var radio = { press: new actions.RadioPress() };
