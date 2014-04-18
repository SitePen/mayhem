import SpriteModel = require('./Sprite');

class BodyModel extends SpriteModel {}
BodyModel.prototype.type = 'body';
BodyModel.prototype.ext = 'svg';

export = BodyModel;