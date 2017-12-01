'use strict'

const npm = require('npm')
const requireg = require('requireg')
const q = require('q')
const deasyncPromise = require('deasync-promise')

const DEFAULT_OPTIONS = {
  isAsync: false,
  global: true,
  ignoreDev: true
}

function assignOptions (options, defaultOptions) {
  const stringifiedOptions = JSON.stringify(options || {})
  const opts = JSON.parse(stringifiedOptions)

  return Object.assign({}, defaultOptions, opts)
}

function extractModulesFromDependencies (dependencies, isGlobal) {
  const keys = Object.keys(dependencies)

  return keys.map(mapDependencies(isGlobal))
}

function filterModuleNames (regexp, modules) {
  const re = new RegExp(regexp)

  return modules.filter((module) => {
    return re.test(module.name)
  })
}

function find (regexp, modules) {
  let matches = []
  const regexps = Array.isArray(regexp) ? regexp : [regexp]
  let results

  regexps.forEach((regexp) => {
    results = filterModuleNames(regexp, modules)

    if (results.length > 0) {
      matches = matches.concat(results)
    }
  })

  return matches
}

function loadModules (modules) {
  let result = {}

  modules.forEach((module) => {
    if (module.global) {
      result[module.name] = requireg(module.name)
    } else {
      result[module.name] = require(module.name)
    }
  })

  return result
}

function getModules (options) {
  let deferred = q.defer()
  let promises = []

  promises.push(listLocalInstalledModules(options.ignoreDev))

  if (options.global) {
    promises.push(listGlobalInstalledModules())
  }

  q.allSettled(promises)
    .then((results) => {
      let modules = []

      results.forEach((result) => {
        modules = modules.concat(result.value)
      })

      // Remove possible duplicates
      modules = modules.filter((element, index, self) => {
        return index === self.indexOf(element)
      })

      deferred.resolve(modules)
    })

  return deferred.promise
}

function listGlobalInstalledModules () {
  return listInstalledModules({ global: true })
}

function listLocalInstalledModules (ignoreDev) {
  return listInstalledModules({ global: false, ignoreDev: ignoreDev })
}

function listInstalledModules (options) {
  const opts = {
    loaded: false,
    progress: false,
    loglevel: 'error',
    global: options.global,
    depth: 0
  }
  let deferred = q.defer()

  npm.load(opts, () => {
    npm.commands.ls([], true, (error, data) => {
      if (error) {
        deferred.reject(error)
      } else {
        let modules = extractModulesFromDependencies(data.dependencies, options.global)

        if (!options.global && !options.ignoreDev) {
          modules = extractModulesFromDependencies(data.devDependencies, false)
        }

        deferred.resolve(modules)
      }
    })
  })

  return deferred.promise
}

function mapDependencies (isGlobal) {
  return (dependency) => {
    return {
      name: dependency,
      global: isGlobal || false
    }
  }
}

module.exports = (regexp, options) => {
  const opts = assignOptions(options, DEFAULT_OPTIONS)
  let deferred = q.defer()

  getModules(opts)
    .then((modules) => {
      const matches = find(regexp, modules)
      const result = loadModules(matches)
      deferred.resolve(result)
    })
    .catch((error) => {
      deferred.reject(error)
    })

  if (opts.isAsync) {
    return deferred.promise
  } else {
    return deasyncPromise(deferred.promise)
  }
}
