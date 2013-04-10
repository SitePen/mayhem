define([
	"dojo/_base/declare",
	"dgrid/OnDemandList",
	"./_DgridMixin"
], function (declare, OnDemandList, _DgridMixin) {
	return declare([ OnDemandList, _DgridMixin ], {
		//	summary:
		//		An extension of the standard dgrid OnDemandList for use
		//		throughout the application.
	});
});