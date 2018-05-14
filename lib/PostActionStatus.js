/**
 * @file PostActionStatus
 * @author Jim Bulkowski <jim.b@paperelectron.com>
 * @project plugin-iterator
 * @license MIT {@link http://opensource.org/licenses/MIT}
 */

'use strict';
const _fp = require('lodash/fp')
/**
 *
 * @module PostActionStatus
 */

module.exports = function(action, plugins){

  let actionResults = _fp.map((p) => {
    return p.getErrors()
  }, plugins)


  let erroredPlugins = _fp.filter((p) => {
    return p.hasErrors
  }, actionResults)

  let ret = {
    action: action,
    failure: !!erroredPlugins.length,
    success: !erroredPlugins.length,
    processed: plugins.length,
    erroredPlugins: erroredPlugins
  }

  return ret
}