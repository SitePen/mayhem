define([
	"dojo/_base/declare",
	"dgrid/OnDemandGrid",
	"./_DgridMixin"
], function (declare, OnDemandGrid, _DgridMixin) {
	return declare([ OnDemandGrid, _DgridMixin ], {
		//	summary:
		//		An basic extension of the standard dgrid OnDemandGrid for use
		//		throughout the application.
	});
});
