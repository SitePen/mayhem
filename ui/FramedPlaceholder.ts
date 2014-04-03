/// <amd-dependency path="./renderer!FramedPlaceholder" />

import Placeholder = require('./Placeholder');

var Renderer:any = require('./renderer!FramedPlaceholder');

class FramedPlaceholder extends Placeholder {
}

FramedPlaceholder.prototype._renderer = new Renderer();

export = FramedPlaceholder;
