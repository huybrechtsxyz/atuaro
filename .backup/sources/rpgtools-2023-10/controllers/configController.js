'use strict'

import configItem from "../items/configItem.js"

class configController {
  datastore;

  /**
   * @param {datastore} datastore
   */
  constructor(datastore) {
    this.datastore = datastore;
  }

  /**
   */
  async initialize() {
    await this.datastore.open();
  }
  
  /**
   */
  async dispose() {
    await this.datastore.close();
  }

  /**
   * 
   * @returns configItem
   */
  async get() {
    let configItem = await this.datastore.findOne(new configItem().key);
    if (configItem) return configItem
    configItem = new configItem();
    await this.datastore.update(configItem);
    return configItem
  }

  /**
   * 
   * @param {string} project 
   * @returns configItem
   */
  async setActiveProject(project) {
    let configItem = await this.get();
    configItem.activeProject = project;
    configItem.activeModule = null;
    configItem.activeWorld = null;
    await this.datastore.update(configItem);
    return configItem;
  }
}

export default configController;