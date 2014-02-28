import _DijitCtor = require('dijit/layout/BorderContainer');
import LayoutContainer = require('./LayoutContainer');

class BorderContainer extends LayoutContainer {
}

BorderContainer.prototype._DijitCtor = _DijitCtor;
BorderContainer.prototype._dijitFields = [ 'gutters', 'liveSplitters', 'persist' ]; // TODO

export = BorderContainer;
