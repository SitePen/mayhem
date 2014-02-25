PEGJSSRC=html.pegjs
PEGJSOUT=html.js

# TODO: add pegjs to devDependencies and use via ./node_modules/etc.
parser: $(PEGJSSRC)
	@echo -n 'Generating parser...'
	@cat $(PEGJSSRC) | pegjs --allowed-start-rules Template,BoundText | sed -e '1 s/.*/define([], function () {/' -e '$$ s/.*/});/' > $(PEGJSOUT)
	@echo 'Done!'
