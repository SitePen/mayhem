import _DijitWidget = require('dijit/layout/AccordionContainer');
import StackContainer = require('./StackContainer')

class AccordionContainer extends StackContainer {
	static _DijitWidget:typeof _DijitWidget = _DijitWidget;
}

AccordionContainer.configureLayout(StackContainer);

export = AccordionContainer;
