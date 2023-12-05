'use strict'

import Datastore from './datastore.js';
import configController from '../controllers/configController.js';

const CONFIG = {
  configDB: 'data/config.db',

  projectData: null,
  applicationPath: null,
  currentWorkPath: null,

  async initialize(appPath, cwdPath) {
    this.applicationPath = appPath;
    this.currentWorkPath = cwdPath;

    this.configController = new configController(new Datastore(appPath, this.configDB));
    await this.configController.initialize();
  },

  async dispose() {
    await this.configController.dispose();
    
    this.configController = null;
  },

  getProjectName() {
    if (projectData) { return (this.projectData.title ?? this.projectData.name); } else return "";
  }
}

export default CONFIG;