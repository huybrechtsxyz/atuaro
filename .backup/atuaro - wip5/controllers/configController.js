'use strict'

import fs from 'fs';
import path from 'path';
import CONFIG from '../lib/config.js';
import { cloneDirectories } from '../lib/filesystem.js';
import configItem from "../items/configItem.js"

class configController {
  datastore;
  template;
  status;

  /**
   * @param {datastore} datastore
   */
  constructor(datastore) {
    this.datastore = datastore;
  }

  /**
   */
  async initialize() {
    //console.debug('Initializing configuration controller');
    await this.datastore.open();
  }
  
  /**
   */
  async dispose() {
    await this.datastore.close();
  }

  /**
   */
  async isInitialized() {
    let item = new configItem();
    item = await this.datastore.findOne(item.key);
    return item.initialized;
  }

  /**
   * 
   * @param {*} options : template
   * @returns boolean
   */
  async create(options) {
    this.template = await this.findProjectTemplate(options.template);
    if (!this.template) {
      this.status = `Invalid template ${options.template} + ' not found`;
      return false;
    }
    cloneDirectories(this.template, CONFIG.currentWorkPath);
    let config = new configItem();
    config = await this.datastore.findOne(config.key);
    config.initialized = true;
    this.datastore.update(config);
    this.status = 'Project initalized'
    return true;
  }

  /**
   * 
   * @param {string} template 
   * @returns either path to template or 
   */
  async findProjectTemplate(template) {
    let folder = path.join(CONFIG.currentWorkPath,'templates','projects',template);
    if(fs.existsSync(folder)) { return folder; }
    folder = path.join(CONFIG.applicationPath,'templates','projects',template);
    if(fs.existsSync(folder)) { return folder; }
    return null;
  }
}

export default configController;