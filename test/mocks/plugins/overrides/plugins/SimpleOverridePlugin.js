/**
 * @file SimpleOverridePlugin
 * @author Jim Bulkowski <jim.b@paperelectron.com>
 * @project plugin-iterator
 * @license MIT {@link http://opensource.org/licenses/MIT}
 */

'use strict';

/**
 *
 * @module SimpleOverridePlugin
 */

exports.metadata = {
  name: 'SimpleOverride',
  type: 'override'
}

exports.override = {
  module: 'SimplePlugin',
  name:'SimplePlugin'
};

exports.plugin = {
  load: function(injector, loaded) {
    loaded(null, {name: 'overridden'})
  },
  start: function(done) {
    done(null)
  },
  stop: function(done) {
    done(null)
  }
}