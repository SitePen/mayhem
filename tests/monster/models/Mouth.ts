import SpriteModel = require('./Sprite');

class MouthModel extends SpriteModel {}
MouthModel.prototype.type = 'mouth';
MouthModel.prototype.ext = 'svg';

export = MouthModel;
