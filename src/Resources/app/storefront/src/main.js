import HMnetFormPlugin from './hmnet-form-plugin/hmnet-form-plugin.plugin';

const PluginManager = window.PluginManager;
PluginManager.register('HMnetFormPlugin', HMnetFormPlugin, '[data-hmnet-form-plugin]');
