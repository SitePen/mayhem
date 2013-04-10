define([
	"dojo/_base/lang",
	"dojo/_base/declare",
	"../../util",
	"./_CrudView",
	"dojo/i18n!../../nls/common",
	"dojo/text!./templates/_CrudBrowse.html",

	"dojox/mobile/Heading",
	"dojox/mobile/ToolBarButton",
	"dojox/mobile/TextBox",
	"../grid/OnDemandGrid"
], function (lang, declare, util, _CrudView, i18n, template) {
	var createSetter = util.createSetter;

	return declare(_CrudView, {
		//	summary:
		//		A base widget that can be extended to easily create a view for
		//		browsing data objects within a `dojo/store` store.

		flexAt: "list",
		i18n: i18n,
		templateString: template,

		//	title: string
		//		The title that is displayed in the header for the view.
		title: null,

		//	store: dojo/store/api/Store
		//		The `dojo/store` store to browse.
		store: null,

		//	showGridHeader: boolean
		//		Whether or not to display column headers on the displayed data
		//		grid.
		showGridHeader: true,

		//	columns: Object
		//		A column definition object that matches the column definition
		//		used by dgrid.
		columns: null,

		//	searchFields: string[]?
		//		An array of field names that will be searched by the search box.
		//		If no fields are provided, the search box will not be displayed.
		searchFields: null,

		//	searchOptions: Object
		//		Additional search options for the search box. Available options
		//		are:
		//		* isCaseInsensitive (boolean): Whether or not to perform a
		//			case-insensitive search.
		searchOptions: { isCaseInsensitive: true },

		//	sortOptions: Object[]
		//		An array of objects that define which attributes can be sorted.
		//		Objects have the following properties:
		//		* name (string): The name of the sort option to display to the
		//			end-user.
		//		* value (Object[]): A set of sort options in the format that
		//			matches what is used by dgrid's `sort` property.
		//		* isDefault (boolean?): The default sort option.
		sortOptions: [],

		//	renderRow: Function?
		//		A function for rendering individual rows in the grid that
		//		matches the signature of dgrid's `renderRow` function.
		renderRow: null,

		//	newHref: string
		//		The URL to enter a new record.
		newHref: null,

		//	_newRecordButton: [protected] dojox/mobile/ToolBarButton
		//		The button used to go to the new record form.
		_newRecordButton: null,

		//	_titleHeading: [protected] dojox/mobile/Heading
		//		The heading widget used by this view.
		_titleHeading: null,

		//	list: framework/grid/OnDemandGrid
		//		The list used to display records from the store.
		list: null,

		//	_searchBox: [protected] framework/widget/SearchBox
		//		The search box used to run searches against the store.
		_searchBox: null,

		//	_sortNode: [protected] DomNode
		//		The container for the sort options.
		_sortNode: null,

		//	_sortSelect: [protected] HTMLSelectElement
		//		The select drop-down that is used by the user to choose how to
		//		sort the list.
		_sortSelect: null,

		_setTitleAttr: createSetter("title", "_titleHeading", "label"),
		_setStoreAttr: createSetter("store", "list"),
		_setShowGridHeaderAttr: createSetter("showGridHeader", "list", "showHeader"),
		_setColumnsAttr: createSetter("columns", "list"),

		_setSearchFieldsAttr: function (value) {
			this._searchBox.domNode.style.display = value ? "" : "none";
			this.layout();
			this._set("searchFields", value);
		},

		_setSortOptionsAttr: function (value) {
			if (!value || !value.length) {
				this._sortNode.style.display = "none";
			}
			else {
				this._sortNode.style.display = "";

				var sortSelect = this._sortSelect;
				while (sortSelect.options.length) {
					sortSelect.remove(0);
				}

				for (var i = 0, option; (option = value[i]); ++i) {
					sortSelect.add(new Option(option.name, i, option.isDefault, option.isDefault));
				}
			}

			this.layout();
			this._set("sortOptions", value);
			this._sort();
		},

		_setRenderRowAttr: function (value) {
			declare.safeMixin(this.list, { renderRow: value });
			this._set("renderRow", value);
		},

		_setNewHrefAttr: function (value) {
			this._newRecordButton.set("href", value);
			this._newRecordButton.domNode.style.display = value ? "" : "none";
			this._set("newHref", value);
		},

		_sort: function () {
			//	summary:
			//		Sorts the list of search results using the value given in
			//		the sort drop-down.

			this.list.set("sort", this.sortOptions[this._sortSelect.value].value);
		},

		_filter: function (/*string*/ value) {
			//	summary:
			//		Filters the list of search results by the given value.
			//	value:
			//		The value to filter against.

			this.list.set("query", this._createQueryFunction(value));
		},

		_createQueryFunction: function (/*string*/ value) {
			//	summary:
			//		Generates a query function that can either be used directly
			//		by a local SimpleQueryEngine or passed directly to a server
			//		as a JavaScript function.
			//	value:
			//		The value to query for.
			//	returns: Function
			//		A filtering function that accepts a record as the first
			//		argument and returns whether or not the record matches the
			//		query.

			function escape(/*string*/ value) {
				//	summary:
				//		Escapes a value to sit within a single-quoted
				//		JavaScript string.
				//	returns: string

				return value.replace(/\\/g, "\\\\").replace(/'/g, "\\'");
			}

			var fields = this.searchFields,
				options = this.searchOptions,
				fn = "return ";

			for (var i = 0, field; (field = fields[i]); ++i) {
				if (i > 0) {
					fn += field.and ? "&&" : "||";
				}

				fn += "record['" + escape(field.attribute || field) + "']" +
					(options.isCaseInsensitive ? ".toLowerCase()" : "") +
					".indexOf('" + escape(options.isCaseInsensitive ? value.toLowerCase() : value) + "') > -1";
			}

			return new Function("record", fn);
		},

		onAfterTransitionOut: function () {
			//	summary:
			//		Clears any selected items from the list after transitioning
			//		away from the browse list.

			this.list.clearSelection();
			this.inherited(arguments);
		}
	});
});