/**
 * @file ErrorHandling
 * @author Jim Bulkowski <jim.b@paperelectron.com>
 * @project plugin-iterator
 * @license MIT {@link http://opensource.org/licenses/MIT}
 */

'use strict';

const tap = require('tap')
const _fp = require('lodash/fp')
const Plugin = require('@pomegranate/plugin-facade')
const getPlugin = require('../mocks/getPlugin')
const path = require('path')
const fs = require('fs')

const util = require('@pomegranate/test-utils')
const applicationBase = path.join(__dirname, '../mocks/plugins/withErrors')
const pluginBase = path.join(applicationBase, 'plugins')
const testPlugins = fs.readdirSync(pluginBase)

const Iterator = require('../../index')

/**
 *
 * @module ErrorHandling
 */

tap.test('Error Behavior', (t) => {
  let plugins = _fp.map((pluginData) => {
    let plugin = getPlugin('withErrors/plugins/', pluginData)
    return new Plugin(plugin)
  }, testPlugins)

  let FrameworkDI = util.mockFrameworkInjector(false, {logLevel: 0}, applicationBase)
  let PluginDI = util.mockPluginDI()

  let IteratorFactory = new Iterator({Plugins: plugins, FrameworkDI, PluginDI})

  IteratorFactory.then((PluginIterator) => {
    t.test('Initialization', (t) => {
      PluginIterator.initialize()
        .then((initResult) => {
          t.equal(plugins.length, initResult.processed, 'Initialized correct number of plugins.')

          t.ok(_fp.every((p) => {
            return p.state.initialized
          }, PluginIterator.getPlugins()), 'All Plugins have been initialized.')

          t.done()
        })
    })

    // t.test('Configuration', (t) => {
    //   PluginIterator.configure()
    //     .then((configuredPlugins) => {
    //       t.equal(plugins.length, configuredPlugins.length, 'Initialized correct number of plugins.')
    //
    //       t.ok(_fp.every((p) => {
    //         return p.state.configured
    //       }, configuredPlugins), 'All Plugins have been configured.')
    //
    //       t.done()
    //     })
    // })
    //
    // t.test('Ordering', (t) => {
    //   PluginIterator.order()
    //     .then((iter) => {
    //       t.equal(iter.systemPlugins.length, 0, 'No system Plugins')
    //       t.equal(iter.unencumberedPlugins.length, 2, '2 Unencumbered plugin')
    //       t.equal(iter.installerPlugins.length, 1, '1 Installer plugins');
    //       t.equal(iter.SortedPlugins.length, 7, '7 total plugins');
    //       t.done()
    //     })
    // })
    //
    // t.test('Loading', (t) => {
    //   PluginIterator.load()
    //     .then((iter) => {
    //
    //       t.done()
    //     })
    // })
    //
    // t.test('Starting', (t) => {
    //   PluginIterator.start()
    //     .then((iter) => {
    //
    //       t.done()
    //     })
    // })
    //
    // t.test('Stopping', (t) => {
    //   PluginIterator.stop()
    //     .then((iter) => {
    //       t.done()
    //     })
    // })

    t.done()
  })
})