/// <reference path="../../../dgrid" />
/// <reference path="../../../dojo" />

import declare = require('dojo/_base/declare');
import Keyboard = require('dgrid/Keyboard');
import List = require('dgrid/List');
import OnDemandList = require('dgrid/OnDemandList');
import Selection = require('dgrid/Selection');

// Adaption of "single" selection mode to always toggle last selected
Selection.prototype['_single-toggleSelectionHandler'] = function (event:Event, target:Node) {
	if (this._lastSelected === target){
		this.select(target, null, !this.isSelected(target));
	}
	else {
		this.clearSelection();
		this.select(target);
		this._lastSelected = target;
	}
};

export var EagerList:typeof List = <typeof List> declare([ List, Keyboard, Selection ]);
export var LazyList:typeof OnDemandList = <typeof OnDemandList> declare([ OnDemandList, Keyboard, Selection ]);
