/**
 * @file SimplePlugin
 * @author Jim Bulkowski <jim.b@paperelectron.com>
 * @project plugin-iterator
 * @license MIT {@link http://opensource.org/licenses/MIT}
 */

'use strict';

/**
 *
 * @module SimplePlugin
 */

exports.options = {
  workDir: '/mockWorkDir'
}

exports.metadata = {
  name: 'simplePlugin',
  type: 'service',
  param: 'simple'
}

exports.plugin = {
  load: function(inject, loaded){
    loaded(null, {name: 'simple'})
  },
  start: function(done){done()},
  stop: function(done){done()}
}