'use strict';

import { error } from "console";
import CONFIG from "../config.js";
import configItem from "../items/configItem.js";
import projectItem from "../items/projectItem.js";
import moduleItem from "../items/moduleItem.js";
import worldItem from "../items/worldItem.js"

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
   */
  async read() {
    return await this.datastore.findOne(new configItem().key);
  }

  /**
   * @param {string} project 
   * @param {array} options    
   */
  async validateModule(project, options) {
    if (options.module) {
      let module = await CONFIG.moduleController.get(new moduleItem(project.name, options.module).key);
      if (module)
        return module.name;
      throw error(`Invalid module ${options.module} for project ${project.name}`);  
    }
    return null;
  }

  /**
   * @param {array} options    
   * @param {boolean} [doThrow=false] 
   */
  async save(options, doThrow = false) {
    let item = await this.datastore.findOne(new configItem().key);
    let value = new configItem();

    // Get project value from options or database
    if (options && options.project && options.project != '')
      value.project = options.project;
    else if (item && item.project && item.project != '')
      value.project = item.project;
    else
      value.project = null;

    // Get module value from options or database
    if (options && options.module && options.module != '')
      value.module = options.module;
    else if (item && item.module && item.module != '')
      value.module = item.module;
    else
      value.module = null;

    // Get world value from options or database
    if (options && options.world && options.world != '')
      value.world = options.world;
    else if (item && item.world && item.world != '')
      value.world = item.world;
    else
      value.world = null;

    // No project? Then no module. Save and exit.
    if (!value.project) {
      value.project = null;
      value.module = null;
      value.world = null;
      await this.datastore.update(new configItem().key, value);
      return value;
    }
    
    // Project not found? Clear. Save and exit.
    if (value.project) {
      let project = await CONFIG.projectController.get(new projectItem(value.project).key);
      if (!project) {
        value.project = null;
        value.module = null;
        value.world = null;
        await this.datastore.update(new configItem().key, value);
        if (doThrow)
          throw new error(`Invalid project ${value.project}`);
        return value;
      }
    }
    
    // Module?
    if (value.module) {
      let module = await CONFIG.moduleController.get(new moduleItem(value.project, value.module).key);
      if (!module) {
        value.module = null;
        if (doThrow)
          throw new error(`Invalid module ${value.module} for project ${value.project}`);
      }
    }

    // World?
    if (value.world) {
      let world = await CONFIG.worldController.get(new worldItem(value.project, value.world).key);
      if (!world) {
        value.world = null;
        if (doThrow)
          throw new error(`Invalid world ${value.world} for project ${value.project}`);
      }
    }

    // All is well, save the values.
    await this.datastore.update(new configItem().key, value);
    return value;
  }
}

export default configController;