import _DijitCtor = require('dijit/Calendar');
import Dijit = require('./Dijit');

class Calendar extends Dijit {
}

Calendar.prototype._DijitCtor = _DijitCtor;

export = Calendar;
