/// <amd-dependency path="./renderer!Image" />

import View = require('./View');
import ui = require('./interfaces');

var Renderer:any = require('./renderer!Image');

class ImageView extends View implements ui.IImage {
	get:ui.IImageGet;
	set:ui.IImageSet;
}

ImageView.prototype._renderer = new Renderer();

export = ImageView;
