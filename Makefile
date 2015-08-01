NODE_MODULES = node_modules

install: $(NODE_MODULES)
	@scripts/postinstall.sh

.PHONY: install

$(NODE_MODULES):
	@npm install &> /dev/null
