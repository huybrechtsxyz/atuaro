'use-strict';

import Datastore from './lib/datastore.js';
import configController from './controllers/configController.js';
import projectController from './controllers/projectController.js';
import moduleController from './controllers/moduleController.js';
import worldController from './controllers/worldController.js';

const CONFIG = {
  configDB: 'data/config.db',
  projectDB: 'data/projects.db',
  moduleDB: 'data/modules.db',
  worldDB: 'data/worlds.db',

  assetsPath: 'assets',
  buildPath: 'bin',
  outputPath: 'dist',
  modulePath: 'mods',
  worldPath: 'worlds',

  moduleFile: 'module.yaml',

  applicationPath: null,
  currentWorkPath: null,
  configController: null,
  projectController: null,
  moduleController: null,
  worldController: null,

  async initialize(appPath, cwdPath) {
    this.applicationPath = appPath;
    this.currentWorkPath = cwdPath;

    this.configController = new configController(new Datastore(appPath, this.configDB));
    this.projectController = new projectController(new Datastore(appPath, this.projectDB));
    this.moduleController = new moduleController(new Datastore(appPath, this.moduleDB));
    this.worldController = new worldController(new Datastore(appPath, this.worldDB));
    
    await this.configController.initialize();
    await this.projectController.initialize();
    await this.moduleController.initialize();
    await this.worldController.initialize();
  },

  async dispose() {
    await this.worldController.dispose();
    await this.moduleController.dispose();
    await this.projectController.dispose();
    await this.configController.dispose();
    
    this.worldController = null;
    this.moduleController = null;
    this.projectController = null;
    this.configController = null;
  },

  async getConfig() {
    return await this.configController.read();
  },

  // { project: abc, module: def }
  async setConfig(options) {
    return await this.configController.save(options);
  }
}

export default CONFIG;