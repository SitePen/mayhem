define([], function () {
	return function (ast) {
		//	summary:
		//		Generates a render function based on the ast.  This is a short-term solution until
		//		we can generate a compiled function.

		console.log('creating render for', ast);
		return function (view) {
			console.log('rendering', view);
			return this.dom('div', {}, [document.createTextNode('Hello World!')]);
		};
	};
});