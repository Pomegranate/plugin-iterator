/**
 * @file Overrides
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
const applicationBase = path.join(__dirname, '../mocks/plugins/overrides')
const pluginBase = path.join(applicationBase, 'plugins')
const testPlugins = fs.readdirSync(pluginBase)


const Iterator = require('../../index')


/**
 *
 * @module Overrides
 */


tap.test('Initializing plugins', (t) => {
  let plugins = _fp.map((pluginData) => {
    let plugin = getPlugin('overrides/plugins/', pluginData)
    return new Plugin(plugin)
  }, testPlugins)

  let FrameworkDI = util.mockFrameworkInjector(false, {logLevel: 0}, applicationBase)
  let PluginDI = util.mockPluginDI()

  let PluginFactory = new Iterator({Plugins: plugins, FrameworkDI, PluginDI})
  PluginFactory.then((PluginIterator) => {
    t.test('Initialization', (t) => {
      PluginIterator.initialize()
        .then((initplugins) => {
          t.equal(plugins.length, initplugins.length, 'Initialized correct number of plugins.')

          t.ok(_fp.every((p) => {
            return p.state.initialized
          }, initplugins), "All Plugins have been initialized.")

          t.done()
        })
    })

    t.test('Configuration', (t) => {
      PluginIterator.configure()
        .then((configuredPlugins) => {
          t.equal(plugins.length, configuredPlugins.length, 'Initialized correct number of plugins.')

          t.ok(_fp.every((p) => {
            return p.state.configured
          }, configuredPlugins), "All Plugins have been configured.")

          t.done()
        })
    })

    t.test('Ordering', (t) => {
      PluginIterator.order()
        .then((iter) => {
          t.equal(iter.overridePlugins.length, 1, '1 override plugins');
          t.equal(iter.SortedPlugins.length, 1, '1 total plugins');
          t.done()
        })
    })

    t.test('Overriding', (t) => {
      PluginIterator.override('message')
        .then((configuredPlugins) => {

          t.done()
        })
    })

    t.test('Sort order', (t) => {
      let pluginOrder = PluginIterator.getOrder()
      // console.log(pluginOrder);
      t.done()
    })

    t.done()
  })

})