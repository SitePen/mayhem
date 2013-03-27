define([ 'dojo/has' ], function (has) {
	//	summary:
	//		Contains common has-rules for application development.

	var minimumWindowDimension = Math.min(window.innerWidth, window.innerHeight);

/*	has.add('phone', has('touch') && minimumWindowDimension < mobileCommon.tabletSize);
	has.add('tablet', has('touch') && minimumWindowDimension >= mobileCommon.tabletSize);*/

	has.add('debug', true);

	return has;
});