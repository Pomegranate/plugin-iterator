/**
 * @file IteratorFactory
 * @author Jim Bulkowski <jim.b@paperelectron.com>
 * @project plugin-iterator
 * @license MIT {@link http://opensource.org/licenses/MIT}
 */

'use strict';
const Promise = require('bluebird')
const Iterator = require('./iterator')
/**
 *
 * @module IteratorFactory
 */

module.exports = function({Plugins, FrameworkDI, PluginDI}){
  return Promise.try(() => {
    return new Iterator({Plugins, FrameworkDI, PluginDI})
  })
}