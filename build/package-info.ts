import * as camelCase from 'lodash.camelcase'

const pkg = require('../package.json')

export const packageName = camelCase(pkg.name)
