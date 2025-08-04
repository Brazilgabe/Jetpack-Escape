const path = require('path');
const Module = require('module');
const originalResolveFilename = Module._resolveFilename;
Module._resolveFilename = function (request, parent, isMain, options) {
  if (request === 'metro/src/ModuleGraph/worker/importLocationsPlugin') {
    return path.join(__dirname, 'metro-import-locations-plugin.js');
  }
  return originalResolveFilename.call(this, request, parent, isMain, options);
};

const { getDefaultConfig } = require('expo/metro-config');
const config = getDefaultConfig(__dirname);
module.exports = config;
