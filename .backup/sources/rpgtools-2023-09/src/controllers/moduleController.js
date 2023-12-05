'use strict';

import fs from 'fs';
import path from 'path';
import jslinq from 'jslinq';

import CONFIG from '../config.js';
import projectItem from '../items/projectItem.js';
import moduleItem from '../items/moduleItem.js';
import moduleBuilder from '../builders/moduleBuilder.js';
import { createDirectory, cloneDirectories } from "../lib/filesystem.js";
import { error } from 'console';

class moduleController {
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
   * @param {Array} options 
   */
  async list(options) {
    let items = await this.datastore.findAll();
    let project = await this.getProjectName(options);

    if (items && items.length>0) {
      items = await this.applyFilter(jslinq(items), project);
      return items;
    }
    return null;
  }

  /**
   * @param {string} name 
   * @param {array} options 
   */
  async get(name, options) {
    let project = await this.getProjectName(options);
    let item = new moduleItem(project, name);
    return await this.datastore.findOne(item.key);
  }

  /**
   * @param {string} name 
   * @param {array} options 
   * @param {boolean} [makeFolder=false] 
   */
  async validate(name, options, makeFolder = false) {
    options.project = await this.getProjectName(options);
    if (!options.project)
      throw error(`Invalid project selected`);

    let project = await CONFIG.projectController.get(new projectItem(options.project).key);
    if (!project)
      throw error(`Invalid project ${options.project} selected`);

    if (options && options.template) {
      options.template = path.resolve(path.join(CONFIG.applicationPath, 'assets', 'modules', options.template));
      if (!fs.existsSync(options.template))
        throw error(`Invalid module template for ${options.template}`);
    }

    if (!fs.existsSync(project.path))
      throw error(`Invalid project ${project.name} target for ${project.path}`);

    options.folder = path.resolve(path.join(project.path, CONFIG.modulePath));
    if (!fs.existsSync(options.folder)) {
      if (makeFolder)
        createDirectory(options.folder);
      else
        throw error(`Invalid module ${name} folder for ${options.folder}`);
    }

    options.folder = path.join(options.folder, name);
    if (!fs.existsSync(options.folder)) {
      if (makeFolder)
        createDirectory(options.folder);
      else 
        throw error(`Invalid module ${name} target for ${options.folder}`);
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
    let item = new moduleItem(options.project, name);
    item = this.setModuleFields(item, options);
    console.log(item);
    console.log(item.key);
    return await this.datastore.create(item.key, item);
  }

  /**
   * @param {string} name 
   * @param {array} options 
   */
  async update(name, options) {
    let item = new moduleItem(options.project, name);
    item = this.setModuleFields(item, options);
    return await this.datastore.update(item.key, item);
  }

  /**
   * @param {string} name 
   * @param {array} options 
   */
  async remove(name, options) {
    let item = new moduleItem(options.project, name);
    return await this.datastore.remove(item.key);
  }

  /**
   * @param {array} options 
   */
  async removeMany(options) {
    let values = await this.list(options);
    for (var member in values) {
      await this.datastore.remove(member.key);
    }
  }

  /**
  * @param {string} name 
  * @param {array} options 
  */
  async build(name, options) {
    let project = await CONFIG.projectController.get(new projectItem(options.project).key);
    if (!project)
      throw error(`Invalid project ${options.project} selected`);
    let module = await this.datastore.findOne(new moduleItem(project.name, name).key);
    if (!module)
      throw error(`Invalid module ${name} for project ${options.project}`);

    console.log(` - Building module ... ${name}`);
    let builder = new moduleBuilder(project, module, options);
    await builder.build();
    console.log(` - Building module ...${name} finished`);
    return module;
  }

  /**
   * @param {jslinq} queryObj 
   * @param {string} project  
   */
  async applyFilter(queryObj, project) {
    if (project)
      return queryObj.where(function(element) { return element.project == project; }).toList();
    else
      return queryObj.toList();
  }

  /**
   * @param {array} options 
   */
  async getProjectName(options) {
    if (options && options.project && options.project != '')
      return options.project;
    let value = await CONFIG.getConfig();
    if (value && value.project && value.project != '')
      return value.project;
    return null;
  }

  /**
   * @param {string} name 
   */
  async getModuleName(name) {
    if (name && name != '')
      return name;
    let value = await CONFIG.getConfig();
    if (value && value.module && value.module != '')
      return value.module;
    return null;
  }

  /**
   * 
   * @param {moduleItem} module 
   * @param {array} options 
   * @returns module
   */
  setModuleFields(module, options) {
    if (options) {
      if (options.vtt) {
        module.vtt = options.vtt;
        module.path = options.location;       
      } else {
        module.vtt = null;
        module.path = null;
      }
    }
    return module;
  }
}

export default moduleController;