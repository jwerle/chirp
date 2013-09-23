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

test: backendtest frontendtest

backendtest:
	$(nbin)/mocha --require ./test/support/back-end/test-bootstrap --ui bdd --reporter spec test/back-end/*.spec.js

frontendtest: build
	$(nbin)/karma start karma.front-end-tests.conf.js

.PHONY: all clean build less test install browser
