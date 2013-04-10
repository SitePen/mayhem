define([
	"dojo/_base/declare",
	"dojo/dom-geometry",
	"dgrid/Keyboard",
	"dgrid/Selection",
	"dgrid/extensions/DijitRegistry"
], function (declare, domGeometry, Keyboard, Selection, DijitRegistry) {
	return declare([ Keyboard, Selection, DijitRegistry ], {
		//	summary:
		//		A dgrid mixin module that includes commonly used dgrid mixins
		//		plus support for dgrid as a layout widget.

        resize: function(changeSize){
			//	summary:
			//		Enables dgrid to work as a layout widget by accepting a
			//		`changeSize` object.

            if(changeSize){
                domGeometry.setMarginBox(this.domNode, changeSize);
            }

            this.inherited(arguments);
        }
	});
});