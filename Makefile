
##
# Inhreit path
PATH := "./node_modules/.bin:$(PATH)"

all: clean install build test

clean: reset
	rm -rf node_modules components

install:
	npm install
	component install

build: reset less browser
	component build --dev -n chirp
	cp ./build/chirp.js ./public/js/chirp.js

less:
	lessc ./less/main.less --include-paths=./less ./build/chirp.css
	cp ./build/chirp.css ./public/css/chirp.css

serve:
	chirp start

browser:
	browserify -s __browser__ ./browser/index.js > ./build/browser.js

reset:
	rm -rf db/*

test:
	@:

.PHONY: all clean build less test install browser
