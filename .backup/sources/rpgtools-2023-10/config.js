'use strict'

import projectController from './controllers/projectController.js';

const CONFIG = {
  projectDB: 'data/projects.db',

  applicationPath: null,
  currentWorkPath: null,

  async initialize(appPath, cwdPath) {
    this.applicationPath = appPath;
    this.currentWorkPath = cwdPath;

    this.projectController = new projectController(new Datastore(appPath, this.projectDB));
  },

  async dispose() {
    await this.projectController.dispose();
    
    this.projectController = null;
  }
}

export default CONFIG;