rm -rf dist
cp -r src dist
find dist/ -name *.js -type f -exec cp {} {}.flow \;
babel --no-babelrc --presets "es2015","react","stage-2" src/test/react/my-schema.js -o dist/test/react/my-schema.js
babel --no-babelrc --presets "es2015","react","stage-2" src/scripts/updateSchema.js -o dist/scripts/updateSchema.js
npm run update-schema
babel src/ -d dist/ "$@" --source-maps
