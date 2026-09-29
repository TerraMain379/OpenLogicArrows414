deps:
	npm install @babel/parser
	npm install @babel/traverse
	npm install prettier
	npm install yaml
	npm install espree
	npm install esquery


init_cache:
	mkdir -p cache
	mkdir -p cache/sources
	mkdir -p cache/output

download_sources: init_cache
	wget -O cache/sources/bundle-shell.js https://logic-arrows.io/bundle-shell.js
	wget -O cache/sources/sw.js https://logic-arrows.io/sw.js
	wget -O cache/sources/bundle.js https://logic-arrows.io/bundle.js?v=1_4
