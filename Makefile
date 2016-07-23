export PATH := $(PWD)/node_modules/.bin/:$(PATH)

SRC := $(shell find src -name "*.js")
LIB := $(SRC:src/%=lib/%)

lib/%.js: src/%.js
	mkdir -p $(dir $@)
	babel $< >$@

build: $(LIB)

test: build
	mocha --compilers js:babel-register -u qunit lib/test.js

lint:
	eslint src

.PHONY: build test lint
