import _DijitCtor = require('dijit/layout/TabContainer');
import StackContainer = require('./StackContainer');

class TabContainer extends StackContainer {
}

TabContainer.prototype._DijitCtor = _DijitCtor;
TabContainer.prototype._dijitFields = [ 'tabPosition', 'tabStrip' ];

export = TabContainer;
