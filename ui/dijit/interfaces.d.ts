/// <reference path="../../dijit" />

export import IContainer = require('dijit/_Container');
export import IWidget = require('dijit/_Widget');
export import IWidgetBase = require('dijit/_WidgetBase');

export interface IContainerWidget extends IWidget, IContainer {
}
