REPORTER = dot
test:
test:
	@NODE_ENV=test ./node_modules/.bin/mocha \
		--reporter $(REPORTER)

.PHONY: test