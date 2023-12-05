'use strict';

import fs from 'fs';
import path from 'path';

import CONFIG from '../config.js';
import projectItem from '../items/projectItem.js';
import projectBuilder from '../builders/projectBuilder.js';
import { createDirectory, cloneDirectories } from "../lib/filesystem.js";

class projectController {
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
   */
  async list() {
    return await this.datastore.findAll();
  }
 
  /**
   * @param {string} key
   */
  async get(key) {
    return await this.datastore.findOne(key);
  }

  /**
   * @param {string} name
   * @param {array} options 
   * @param {boolean} [makeFolder=false] 
   */
  validate(name, options, makeFolder = false) {
    if (options) {
      if (options.template) {
        options.template = path.resolve(path.join(CONFIG.applicationPath, 'assets', 'projects', options.template));
        if (!fs.existsSync(options.template))
          throw error(`Invalid project template for ${options.template}`);
      }
      if (options.folder) {
        options.folder = path.resolve(options.folder);
        if (!fs.existsSync(options.folder))
          throw error(`Invalid target for ${options.folder}`);
        if (makeFolder)
          options.folder = path.resolve(path.join(options.folder, name));
      }
    }
    return options;
  }

  /**
   * @param {string} name 
   * @param {array} options 
   * @param {boolean} [makeFolder=false] 
   */
  async create(name, options, makeFolder = false) {
    if (makeFolder) {
      createDirectory(options.folder);
      cloneDirectories(options.template, options.folder);
    }
    let item = new projectItem(name, options.folder);
    return await this.datastore.create(item.key, item);
  }

  /**
   * @param {string} name 
   * @param {array} options 
   */
  async update(name, options) {
    let item = new projectItem(name, options.folder);
    return item = await this.datastore.modify(item.key, item);
  }

  /**
   * @param {string} name 
   */
  async remove(name) {
    let deleted = await this.datastore.remove(new projectItem(name).key);
    if (deleted) {
      await CONFIG.moduleController.removeMany({ project: name });
    }
  }

  /**
  * @param {string} name 
  * @param {array} options 
  */
  async build(name, options) {
    let project = await CONFIG.projectController.get(new projectItem(name).key);
    if (!project)
      throw error(`Invalid project ${name} selected`);
    
    console.log(` - Building project ...`);
    let builder = new projectBuilder(name, options);
    await builder.build();
    console.log(` - Building project ... finished`);
  }
}

export default projectController;