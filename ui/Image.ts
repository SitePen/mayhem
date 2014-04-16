/// <amd-dependency path="./renderer!Image" />

import View = require('./View');
import ui = require('./interfaces');

var Renderer:any = require('./renderer!Image');

class Image extends View implements ui.IImage {
	get:ui.IImageGet;
	set:ui.IImageSet;
}

Image.set('role', 'img');
Image.prototype._renderer = new Renderer();

export = Image;
