'use strict'

const path = require('path')

const DEFAULT_OPTIONS = {
  ignoreDev: true
}

function assignOptions (options, defaultOptions) {
  // Making a deep copy of the provided options
  const stringifiedOptions = JSON.stringify(options || {})
  let opts = JSON.parse(stringifiedOptions)

  return Object.assign({}, defaultOptions, opts)
}

function filterModuleNames (regexp, moduleNames) {
  const re = new RegExp(regexp)

  return moduleNames.filter((moduleName) => {
    return re.test(moduleName)
  })
}

function find (regexp, moduleNames) {
  let matches = []
  const regexps = Array.isArray(regexp) ? regexp : [regexp]
  let results

  regexps.forEach((regexp) => {
    results = filterModuleNames(regexp, moduleNames)

    if (results.length > 0) {
      matches = matches.concat(results)
    }
  })

  return matches
}

function getDependenciesNames (pkg, ignoreDev) {
  let dependenciesNames = Object.keys(pkg.dependencies)

  if (!ignoreDev) {
    dependenciesNames = dependenciesNames.concat(Object.keys(pkg.devDependencies))
  }

  return dependenciesNames
}

function loadPackageJson (packageJson) {
  let pkg
  const packageJsonType = typeof packageJson

  switch (packageJsonType) {
    case 'string':
      const packageJsonPath = path.resolve(__dirname, packageJson)
      pkg = require(packageJsonPath)
      break

    case 'object':
      pkg = packageJson
      break

    default:
      throw new Error('Invalid package.json format.')
  }

  return pkg
}

function loadModules (moduleNames) {
  let modules = {}

  moduleNames.forEach((moduleName) => {
    modules[moduleName] = require(moduleName)
  })

  return modules
}

module.exports = (regexp, packageJson, options) => {
  const opts = assignOptions(options, DEFAULT_OPTIONS)
  const pkg = loadPackageJson(packageJson)
  const dependenciesNames = getDependenciesNames(pkg, opts.ignoreDev)
  const matches = find(regexp, dependenciesNames)

  return loadModules(matches)
}
