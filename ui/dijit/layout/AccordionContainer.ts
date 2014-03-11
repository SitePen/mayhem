import configure = require('../configure');
import layout = require('./interfaces');
import Dijit = require('dijit/layout/AccordionContainer');
import StackContainer = require('./StackContainer')

class AccordionContainer extends StackContainer implements layout.IAccordionContainer {
	get:layout.IAccordionContainerGet;
	set:layout.IAccordionContainerSet;
}

configure(AccordionContainer, {
	Base: StackContainer,
	Dijit: Dijit
});

export = AccordionContainer;
