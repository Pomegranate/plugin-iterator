/**
 * @file aPlugin
 * @author Jim Bulkowski <jim.b@paperelectron.com>
 * @project plugin-iterator
 * @license MIT {@link http://opensource.org/licenses/MIT}
 */

'use strict';

/**
 *
 * @module aPlugin
 */

exports.options = {
}

exports.metadata = {
  name: 'aPlugin',
  type: 'service',
  param: 'A',
  depends: ['H']
}

exports.plugin = {
  load: function(inject, loaded){
    loaded(null, {name: 'A'})
  },
  start: function(done){done()},
  stop: function(done){done()}
}

exports.errors = {}

exports.commands = {}