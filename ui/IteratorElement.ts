/// <amd-dependency path="./renderer!IteratorElement" />

import ContentView = require('./ContentView');

var Renderer:any = require('./renderer!IteratorElement');

class IteratorElement extends ContentView {}

IteratorElement.prototype._renderer = new Renderer();

export = IteratorElement;
