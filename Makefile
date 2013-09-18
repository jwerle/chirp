
##
# Inhreit path
PATH := "./node_modules/.bin:$(PATH)"

all: clean install build test

clean:
	rm -rf node_modules components db/*

install:
	npm install
	component install

build: less browser
	component build --dev -n chirp
	cp ./build/chirp.js ./public/js/chirp.js

less:
	lessc ./less/main.less --include-paths=./less ./build/chirp.css
	cp ./build/chirp.css ./public/css/chirp.css

serve:
	chirp start

browser:
	browserify -s __browser__ ./browser/index.js > ./build/browser.js

test:
	@:

.PHONY: all clean build less test install browser
