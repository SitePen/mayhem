import _DijitCtor = require('dijit/layout/AccordionContainer');
import StackContainer = require('./StackContainer')

class AccordionContainer extends StackContainer {
}

AccordionContainer.prototype._DijitCtor = _DijitCtor;

export = AccordionContainer;
