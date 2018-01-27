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
  name: 'hPlugin',
  type: 'service',
  param: 'H',
  provides: ['C']
}

exports.plugin = {
  load: function(inject, loaded){
    loaded(null, {name: 'H'})
  },
  start: function(done){done()},
  stop: function(done){done()}
}

exports.errors = {}

exports.commands = {}