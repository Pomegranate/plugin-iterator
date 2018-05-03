/**
 * @file PluginInitilization
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
const applicationBase = path.join(__dirname, '../mocks/plugins/common')
const pluginBase = path.join(applicationBase, 'plugins')
const testPlugins = fs.readdirSync(pluginBase)

const Iterator = require('../../index')

/**
 *
 * @module PluginInitilization
 */


tap.test('Instantiation', (t) => {
  let plugins = _fp.map((pluginData) => {
    let plugin = getPlugin('common/plugins/', pluginData)
    return new Plugin(plugin)
  }, testPlugins)

  let FrameworkDI = util.mockFrameworkInjector(true, {}, applicationBase)
  let PluginDI = util.mockPluginDI()

  let IteratorFactory = new Iterator({Plugins: plugins, FrameworkDI, PluginDI})
  IteratorFactory.then((PluginIterator) => {
    t.type(PluginIterator, 'PluginIterator', 'Has correct type.')
    t.done()
  })

})

tap.test('Initializing plugins', (t) => {
  let plugins = _fp.map((pluginData) => {
    let plugin = getPlugin('common/plugins/', pluginData)
    return new Plugin(plugin)
  }, testPlugins)

  let FrameworkDI = util.mockFrameworkInjector(false, {logLevel: 0}, applicationBase)
  let PluginDI = util.mockPluginDI()

  let IteratorFactory = new Iterator({Plugins: plugins, FrameworkDI, PluginDI})

  IteratorFactory.then((PluginIterator) => {
    t.test('Initialization', (t) => {
      PluginIterator.initialize()
        .then((initializeResult) => {
          t.equal(plugins.length, initializeResult.processed, 'Initialized correct number of plugins.')

          t.ok(_fp.every((p) => {
            return p.state.initialized
          }, PluginIterator.getPlugins()), 'All Plugins have been initialized.')

          t.done()
        })
    })

    t.test('Configuration', (t) => {
      PluginIterator.configure()
        .then((configureResult) => {
          t.equal(plugins.length, configureResult.processed, 'Initialized correct number of plugins.')

          t.ok(_fp.every((p) => {
            return p.state.configured
          }, PluginIterator.getPlugins()), 'All Plugins have been configured.')

          t.done()
        })
    })

    t.test('Ordering', (t) => {
      PluginIterator.order()
        .then((iter) => {
          t.equal(iter.systemPlugins.length, 0, 'No system Plugins')
          t.equal(iter.unencumberedPlugins.length, 2, '2 Unencumbered plugin')
          t.equal(iter.installerPlugins.length, 1, '1 Installer plugins');
          t.equal(iter.SortedPlugins.length, 7, '7 total plugins');
          t.done()
        })
    })

    t.test('Loading', (t) => {
      PluginIterator.load()
        .then((iter) => {

          t.done()
        })
    })

    t.test('Starting', (t) => {
      PluginIterator.start()
        .then((iter) => {

          t.done()
        })
    })

    t.test('Stopping', (t) => {
      PluginIterator.stop()
        .then((iter) => {
          t.done()
        })
    })

    t.done()
  })
})