define([ 'dojo/has', 'dojox/mobile/common' ], function (has, mobileCommon) {
	//	summary:
	//		Contains common has-rules for application development.

	var minimumWindowDimension = Math.min(window.innerWidth, window.innerHeight);

	has.add('phone', has('touch') && minimumWindowDimension < mobileCommon.tabletSize);
	has.add('tablet', has('touch') && minimumWindowDimension >= mobileCommon.tabletSize);

	return has;
});