import __AccordionContainer = require('dijit/layout/AccordionContainer');
import StackContainer = require('./StackContainer')

class AccordionContainer extends StackContainer {
	constructor(kwArgs:Object = {}) {
		this._setDijitCtor(__AccordionContainer);
		super(kwArgs);
	}
}

export = AccordionContainer;
