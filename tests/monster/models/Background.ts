import SpriteModel = require('./Sprite');

class BackgroundModel extends SpriteModel {}
BackgroundModel.prototype.type = 'background';
BackgroundModel.prototype.ext = 'png';

export = BackgroundModel;
