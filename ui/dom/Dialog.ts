import domConstruct = require('dojo/dom-construct');
import DomContainer = require('./Container');
import domUtil = require('./util');
import PlacePosition = require('../PlacePosition');
import widgets = require('../interfaces');

/**
 * The Element class provides a DOM-specific widget that encapsulates one or more DOM nodes.
 */
class Element extends DomContainer {
	html:string;

	// TODO: no constructor on DomContainer
	// constructor(kwArgs:Object) {
	// 	super(kwArgs);
	// }

	_htmlSetter(html:string):void {
		this.empty();
		domUtil.getRange(this.firstNode, this.lastNode, true).deleteContents();
		this.lastNode.parentNode.insertBefore(domConstruct.toDom(html), this.lastNode);
	}
}

export = Element;

/*
<Dialog>
	<div class="header">
		<div class="actions">
			<Placeholder TitleButtons>
		</div>
		<div class="title">
			<Placeholder Title>
		</div>
	</div>
	<div class="content">
		<Placeholder Content>
	</div>
	<div class="footer">
		<Placeholder ActionButtons>
	</div>
</Dialog>

extending original template

<MyDialog>
	<Content select=".header"></Content>
	<Content select=".footer"></Content>
</MyDialog>*/
