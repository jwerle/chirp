nbin=./node_modules/.bin
bin=./bin

all: clean install build test

clean: reset
	rm -rf node_modules components

install:
	npm install
	$(nbin)/component install

build: reset less browser
	$(nbin)/component build --dev -n chirp
	cp ./build/chirp.js ./public/js/chirp.js

less:
	$(nbin)/lessc ./less/main.less --include-paths=./less ./build/chirp.css
	cp ./build/chirp.css ./public/css/chirp.css

serve:
	$(bin)/chirp start

browser:
	$(nbin)/browserify -s __browser__ ./browser/index.js > ./build/browser.js

reset:
	rm -rf db
	rm -rf build
	@mkdir db
	@mkdir build

test:
	@:

.PHONY: all clean build less test install browser
