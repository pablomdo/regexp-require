# regexp-module-loader [![Build Status](https://travis-ci.org/kryptogeist/regexp-module-loader.svg?branch=develop)](https://travis-ci.org/kryptogeist/regexp-module-loader)

Load multiple node modules at once using regular expressions

## Install
`$ npm install regexp-module-loader`

## Usage
```
regexp - string, RegExp, Array(string|RegExp)
packageJson - object, string
options - See options below
```

`rml(regexp, packageJson, [options])`

`regexp-module-loader` will load modules that macth the provied regexp and are defined in your `package.json` file as a dependency.

```javascript
const rml = require('regexp-module-loader')
```

```javascript
const pkg = require('./package.json')
const modules = rml('some-module-', pkg)
```

Or you can specify the path to your `package.json`, like this:

```javascript
const modules = rml('some-module-', './path/to/package.json')
```


## Options
### ignoreDev (default=false)

Ignore devDependencies modules.

```javascript
const rml = require('regexp-module-loader')

const pkg = require('./package.json')
const modules = rml('some-module-', pkg, { ignoreDev: true })
```

## Example

Given the following `package.json` as an example:

```json
{
  "name": "my-module",
  "dependencies": {
    "some-module-to-write": "1.0.0",
    "some-module-to-read": "1.0.0",
    "other-module-to-do-stuff": "1.0.0",
  }
}
```

Let's load all modules that matches "some-module-":

```javascript
const rml = require('regexp-module-loader')

const pkg = require('./package.json')
const modules = rml('some-module-', pkg)

modules['some-module-to-write']()
modules['some-module-to-read']()
typeof modules['other-module-to-do-stuff'] // 'undefined'
```

`modules` will be an object where its properties are the module name and its values the module itself.

In this example, the modules `some-module-to-write` and `some-module-to-read` will be loaded into `modules`. The other module `other-module-to-do-stuff` will not be loaded since it did not match the provided regexp.

## License
MIT
