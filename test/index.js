'use strict'

const mock = require('mock-require')
const expect = require('chai').expect
const sinon = require('sinon')
const rml = require('../index.js')

function generatePackageJson(dependencies, devDependencies) {
  let pkgJson = {
    dependencies: {},
    devDependencies: {}
  }

  const deps = Array.isArray(dependencies) ? dependencies : []
  const devDeps = Array.isArray(devDependencies) ? devDependencies : []

  deps.forEach((dependency) => {
    pkgJson.dependencies[dependency] = sinon.spy()
  })

  devDeps.forEach((devDependency) => {
    pkgJson.devDependencies[devDependency] = sinon.spy()
  })

  return pkgJson
}

function mockModules() {
  const dependencies = Array.from(arguments)

  dependencies.forEach((dependency) => {
    for (let key in dependency) {
      mock(key, dependency[key])
    }
  })
}

describe('regexp-module-loader', () => {
  afterEach(() => {
    mock.stopAll()
  })

  it('should load all matches', () => {
    const regexps = 'mock-test-'

    const dependencies = ['mock-test-1', 'mock-test-2']
    const devDependencies = ['mock-test-dev-1', 'mock-test-dev-2']
    const pkgJson = generatePackageJson(dependencies, devDependencies)
    mockModules(pkgJson.dependencies, pkgJson.devDependencies)

    const actual = rml(regexps, pkgJson, { ignoreDev: false })
    const expected = dependencies.concat(devDependencies)

    expected.forEach((moduleName) => {
      expect(actual).to.have.property(moduleName)
    })
  })

  it('should not load modules that did not have any matches', () => {
    const regexps = 'mock-test-'

    const dependencies = ['mock-test-1', 'mock-test-2', 'do-not-load-this']
    const devDependencies = ['mock-test-dev-1', 'mock-test-dev-2', 'do-not-load-this-dev']
    const pkgJson = generatePackageJson(dependencies, devDependencies)
    mockModules(pkgJson.dependencies, pkgJson.devDependencies)

    const expected = [
      'do-not-load-this',
      'do-not-load-this-dev'
    ]

    const actual = rml(regexps, pkgJson)

    expected.forEach((moduleName) => {
      expect(actual).to.not.have.property(moduleName)
    })
  })

  it('should not load devDependencies if ignoreTrue = true', () => {
    const regexps = 'mock-test-'
    const dependencies = ['mock-test-1', 'mock-test-2']
    const devDependencies = ['mock-test-dev-1', 'mock-test-dev-2']
    const pkgJson = generatePackageJson(dependencies, devDependencies)
    mockModules(pkgJson.dependencies, pkgJson.devDependencies)

    const actual = rml(regexps, pkgJson, { ignoreDev: true })

    devDependencies.forEach((moduleName) => {
      expect(actual).to.not.have.property(moduleName)
    })
  })

  it('should accept a path to package.json', () => {
    const regexps = 'mock-test-'
    const dependencies = ['mock-test-1', 'mock-test-2']
    const pkgJson = generatePackageJson(dependencies)
    const pathToPackageJson = '/path/to/package.json'
    mock(pathToPackageJson, pkgJson)
    mockModules(pkgJson.dependencies, pkgJson.devDependencies)

    const actual = rml(regexps, pathToPackageJson)

    dependencies.forEach((moduleName) => {
      expect(actual).to.have.property(moduleName)
    })
  })

  it('should throw an error if package.json is neither a string or an object', () => {
    const regexps = ['mock-test-']

    expect(() => { rml(regexps, 420) }).to.throw('Invalid package.json format.')
  })

  it('should accept multiple regular expressions', () => {
    const regexps = ['mock-a-', 'mock-b-']
    const dependencies = ['mock-a-1', 'mock-a-2', 'mock-b-1', 'mock-c-1']
    const pkgJson = generatePackageJson(dependencies)
    mockModules(pkgJson.dependencies)

    const actual = rml(regexps, pkgJson)
    const expected = ['mock-a-1', 'mock-a-2', 'mock-b-1']

    expected.forEach((moduleName) => {
      expect(actual).to.have.property(moduleName)
    })

    expect(actual).to.not.have.property('mock-c-1')
  })

  it('should return an empty object if no matches were found', () => {
    const regexps = 'mock-c-'
    const dependencies = ['mock-a-1', 'mock-a-2', 'mock-b-1']
    const pkgJson = generatePackageJson(dependencies)
    mockModules(pkgJson.dependencies)

    const actual = rml(regexps, pkgJson)

    expect(Object.keys(actual)).to.be.empty
  })

  it('should support regular expressions', () => {
    const regexps = [/mock-test-[1-3]/, /test-dev-[1-2]/]

    const dependencies = ['mock-test-1', 'mock-test-2', 'mock-test-3', 'mock-test-4']
    const devDependencies = ['mock-test-dev-1', 'mock-test-dev-2', 'mock-test-dev-3']
    const pkgJson = generatePackageJson(dependencies, devDependencies)
    mockModules(pkgJson.dependencies, pkgJson.devDependencies)

    const actual = rml(regexps, pkgJson, { ignoreDev: false })
    const expected = ['mock-test-1', 'mock-test-2', 'mock-test-3', 'mock-test-dev-1', 'mock-test-dev-2']

    expect(Object.keys(actual).length).to.equal(5)

    expected.forEach((moduleName) => {
      expect(actual).to.have.property(moduleName)
    })
  })
})
