# regexp-require

Load NPM modules by using Regular Expressions.

This module is useful if you need to load multiple NPM modules that follow a name pattern at once .

## install

`$ npm install --save regexp-require`

## example

Given that you have the following Grunt plugins installed and want to load all of them at once:

* `grunt-contrib-clean`
* `grunt-contrib-htmlmin`
* `grunt-contrib-imagemin`

You can use the following code snippet to load them:

```javascript
const rrequire = require('regexp-require')
const gruntPlugins = rrequire(/^grunt-contrib-/)
```
The modules will be loaded into the `gruntPlugins` object. Each module can accessed by its name, as it will be just a key in the object.

```javascript
gruntPlugins['grunt-contrib-clean']
gruntPlugins['grunt-contrib-htmlmin']
gruntPlugins['grunt-contrib-imagemin']
```

In this example, the pattern `^grunt-contrib-` will match all modules installed that the name starts with "grunt-contrib-".


## License
MIT
