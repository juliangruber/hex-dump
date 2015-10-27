
example-simple:
	@node_modules/.bin/beefy example/simple.js -- -t brfs

example-pad:
	@node_modules/.bin/beefy example/pad.js -- -t brfs

example-special-chars:
	@node_modules/.bin/beefy example/special-chars.js -- -t brfs

.PHONY: example-simple example-pad example-special-chars

