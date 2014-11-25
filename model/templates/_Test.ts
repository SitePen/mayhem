/// <reference path="../../intern.d.ts" />

import assert = require('intern/chai!assert');
import registerSuite = require('intern!object');<% if (persistent) { %>
import TestStore = require('../../support/TestStore');<% } %>
import <%= modelName %> = require('../../../models/<%= modelName %>');
<% if (persistent) { %>
var store = new TestStore<<%= modelName %>>();
<%= modelName %>.setDefaultStore(store);
<% } %>
var model:<%= modelName %>;

registerSuite({
	name: '<%= modelName %>',

	beforeEach():void {
		model = new <%= modelName %>(<% if (persistent) { %>{ autoSave: false }<% } %>);
	}
});
