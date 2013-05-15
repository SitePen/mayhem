PEGJSSRC=templateParser.pegjs
PEGJSOUT=templateParser.js
DATABINDSRC=expressionParser.pegjs
DATABINDOUT=expressionParser.js

# TODO: add pegjs to devDependencies and use via ./node_modules/etc.
parser: $(PEGJSSRC)
	@echo -n 'Generating parser...'
	@cat $(PEGJSSRC) | pegjs --track-line-and-column | sed -e '1 s/.*/define([], function () {/' -e '$$ s/.*/});/' > $(PEGJSOUT)
	@cat $(DATABINDSRC) | pegjs --track-line-and-column | sed -e '1 s/.*/define([], function () {/' -e '$$ s/.*/});/' > $(DATABINDOUT)
	@echo 'Done!'
