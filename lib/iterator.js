/**
 * @file iterator
 * @author Jim Bulkowski <jim.b@paperelectron.com>
 * @project plugin-iterator
 * @license MIT {@link http://opensource.org/licenses/MIT}
 */

'use strict';
const Promise = require('bluebird')
const _fp = require('lodash/fp')
// const topoSort = require('@pomegranate/toposorter')
// const topoVersion = require('@pomegranate/toposorter/package.json').version
// const iteratorVersion = require('../package.json').version

const PostActionStatus = require('./PostActionStatus')

// const getErrors = _fp.compose(_fp.filter(p => p.hasErrors), _fp.map(p => p.getErrors()))

/**
 *
 * @module iterator
 */

class PluginIterator {

  constructor({Plugins, FrameworkDI, PluginDI}) {
    this.FrameworkDI = FrameworkDI
    this.PluginDI = PluginDI
    this.ungroupedPlugins = Plugins
    this.totalPluginCount = Plugins.length

    // this.IteratorLogger = this.FrameworkDI.get('LoggerFactory')('pomegranate/plugin-iterator', {overrideColor: 'magenta'})

    // FrameworkDI.get('InternalVersions').log('@pomegranate/plugin-iterator', iteratorVersion)
    // FrameworkDI.get('InternalVersions').log('@pomegranate/toposorter', topoVersion)
  }

  runCommand(command, args) {
    return this._iterateFlexible(this.SortedPlugins, function(p) {
      return p.runCommand(command, args)
    })
  }

  initialize() {
    return Promise.each(this.ungroupedPlugins, (plugin) => {
        return plugin.initialize && plugin.initialize({FrameworkDI: this.FrameworkDI, PluginDI: this.PluginDI})
      })
      .then((result) => {
        return PostActionStatus('initialize', result)
      })
  }

  configure() {
    return Promise.try(() => {

        let paramMapper = plugin => plugin.IProperty('paramName')
        let remover = i => !_fp.isString(i)
        this.availableParameters = _fp.compose(_fp.remove(remover), _fp.uniq, _fp.map(paramMapper))(this.ungroupedPlugins)

        let modMapper = plugin => plugin.IProperty('configName')
        this.loadedModules = _fp.map(modMapper, this.ungroupedPlugins)

        return Promise.each(this.ungroupedPlugins, (plugin) => {
          return plugin.configure(this.availableParameters)
        })
      })
      .then((result) => {
        return PostActionStatus('configure', result)
      })

  }

  order() {

    return Promise.try(() => {

      let topoSort = this.FrameworkDI.get('PomModules').TopoSorter.module

      let mutatingRemove = _fp.remove.convert({immutable: false})

      let workdirMapper = p => {
        return {
          configName: p.IProperty('configName'),
          parentName: p.IProperty('parentModule'),
          moduleName: p.IProperty('ModuleName'),
          workDir: p.IProperty('getComputedDirectory')()
        }
      }

      let workDirFilter = p => {
        return p.workDir && p.configName
      }

      let workdirTransform = _fp.transform((result, p) => {
        return result[p.configName] = p
      }, {})

      let mapWorkdir = _fp.compose(workdirTransform, _fp.filter(workDirFilter), _fp.map(workdirMapper))

      //Our topologically sorted plugins

      let sorted = topoSort(this.ungroupedPlugins)

      this.systemPlugins = mutatingRemove((plugin) => {
        return plugin.system
      }, sorted)

      this.unencumberedPlugins = mutatingRemove((plugin) => {
        return (!plugin.IProperty('depends.length') &&
          !plugin.IProperty('optional.length') &&
          plugin.IProperty('type') !== 'installer' &&
          plugin.IProperty('type') !== 'override')
      }, sorted)

      this.installerPlugins = mutatingRemove((plugin) => {
        return plugin.IProperty('type') === 'installer'
      }, sorted)

      this.overridePlugins = mutatingRemove((plugin) => {
        return plugin.IProperty('type') === 'override'
      }, sorted)

      this.SortedPlugins = this.systemPlugins.concat(this.unencumberedPlugins.concat(sorted))

      this.FrameworkDI.service('WorkDirs', mapWorkdir(this.SortedPlugins))

      // More FP way of doing this? Can a plugin become invalid after a hook phase?
      this.allValid = _fp.every((p) => {
        return p.validPlugin(this.loadedModules, this.availableParameters)
      }, this.SortedPlugins)

      if(!this.allValid) {
        return Promise.reject(new Error('Invalid Plugins Present'))
      }

      this.FrameworkDI.get('FrameworkLogger').log('Plugin sort complete.')
      return Promise.resolve(this)
    })

  }

  getCommands(){
    return _fp.filter(Boolean, _fp.map((plugin) => {
      // return plugin.getCommands()
    }, this.ungroupedPlugins))
  }

  getPlugins() {
    return this.SortedPlugins || []
  }

  getErrors(withStacks) {
    let getErrors = _fp.compose(_fp.filter(p => p.hasErrors), _fp.map(p => p.getErrors(withStacks)))
    return getErrors(this.getPlugins())
  }

  getOrder() {
    return _fp.map((p) => {
      return `${p.ModuleName} - ${p.configName}`
    }, this.SortedPlugins)
  }

  _iterate(plugins, action, opts) {
    return Promise.mapSeries(plugins, function(p) {
      return p.runHook(action)
        .then((res) => {
          return res
        })
    }, {concurrency: 1})
  }

  _iterateFlexible(plugins, action, opts) {
    return Promise.mapSeries(plugins, action, {concurrency: 1})
  }

  _install() {
    if(this.installerPlugins.length) {
      /**
       * TODO - Logging? Other stuff.
       * @author - Jim Bulkowski
       * @date - 12/13/17
       * @time - 12:59 AM
       */

    }
    return this._iterate(this.installerPlugins, 'load')
  }

  override(SystemMessage) {
    if(this.overridePlugins.length) {
      /**
       * TODO - Logging? Other stuff.
       * @author - Jim Bulkowski
       * @date - 12/13/17
       * @time - 12:59 AM
       */
      this.FrameworkDI.get('SystemLogger').log(SystemMessage)
      _fp.each((p) => {
        let overrideParameters = p.IProperty('getOverrideMeta')()
        let toOverride = _fp.find((m) => {
          return m.configName === overrideParameters.name
        }, this.SortedPlugins)

        if(toOverride) {
          let newHooks = p.IProperty('getHooks')()
          toOverride.setOverrideHooks(newHooks)
        }

      }, this.overridePlugins)
    }
    return Promise.resolve(true)
  }

  // Agglomerate the install and load hooks. We need installers to go first for obvious reasons.
  load() {
    return this._install()
      .then((result) => {
        let installResult = PostActionStatus('load', result)

        // if(installResult.failure) {
        //   return installResult
        // }
        return Promise.props({
          installer: installResult,
          loadHooks: this._iterateFlexible(this.SortedPlugins, function(p) {
              return p.runHook('load')
            })
            .then((result) => {
              return PostActionStatus('load', result)
            })
        })
      })
      .then((result) => {
        let combined = {
          action: 'load',
          failure: _fp.some(Boolean, [result.installer.failure, result.loadHooks.failure]),
          success: _fp.every(Boolean, [result.installer.success, result.loadHooks.success]),
          processed: result.installer.processed + result.loadHooks.processed,
          erroredPlugins: result.installer.erroredPlugins.concat(result.loadHooks.erroredPlugins)
        }

        return combined
      })
  }

  start() {
    return this._iterateFlexible(this.SortedPlugins, function(p) {
        return p.runHook('start')
      })
      .then((result) => {
        return PostActionStatus('start', result)
      })
  }

  stop() {
    return this._iterateFlexible(_fp.reverse(this.SortedPlugins), function(p) {
        return p.runHook('stop')
      })
      .then((result) => {
        return PostActionStatus('stop', result)
      })
  }

  getMeta() {
    return {
      count: this.totalPluginCount
    }
  }

}

module.exports = PluginIterator