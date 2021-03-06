process.env.BABEL_ENV = 'production'

var fs = require('fs')
var path = require('path')
var rollup = require('rollup')
var uglify = require('uglify-js')
var nodeResolve = require('rollup-plugin-node-resolve')
var babel = require('rollup-plugin-babel')
var version = process.env.VERSION || require('../package.json').version

var banner =
  '/*!\n' +
  ' * ND-PROMISE v' + version + '\n' +
  ' * (c) ' + new Date().getFullYear() + ' crossjs\n' +
  ' * Released under the MIT License.\n' +
  ' */'

// cjs
rollup.rollup({
  entry: 'src/index.js',
  plugins: [
    babel()
  ]
})
.then(function (bundle) {
  var code = bundle.generate({
    format: 'cjs',
    banner
  }).code
  return write('dist/index.js', code).then(function () {
    return code
  })
})
.then(function (code) {
  var minified = banner + '\n' + uglify.minify(code, {
    fromString: true,
    output: {
      ascii_only: true
    }
  }).code
  return write('dist/index.min.js', minified)
})
.catch(logError)

// iife
rollup.rollup({
  entry: 'src/index.js',
  plugins: [
    nodeResolve({
      jsnext: true,
      browser: true
    }),
    babel()
  ]
})
.then(function (bundle) {
  var code = bundle.generate({
    format: 'iife',
    moduleName: 'ndpromise',
    banner
  }).code
  return write('index.js', code).then(function () {
    return code
  })
})
.then(function (code) {
  var minified = banner + '\n' + uglify.minify(code, {
    fromString: true,
    output: {
      ascii_only: true
    }
  }).code
  return write('index.min.js', minified)
})
.catch(logError)

function write (dest, code) {
  return new Promise(function (resolve, reject) {
    fs.writeFile(dest, code, function (err) {
      if (err) return reject(err)
      console.log(blue(dest) + ' ' + getSize(code))
      resolve()
    })
  })
}

function getSize (code) {
  return (code.length / 1024).toFixed(2) + 'kb'
}

function logError (e) {
  console.log(e)
}

function blue (str) {
  return '\x1b[1m\x1b[34m' + str + '\x1b[39m\x1b[22m'
}
