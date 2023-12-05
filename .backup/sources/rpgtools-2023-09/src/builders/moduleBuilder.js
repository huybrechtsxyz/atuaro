'use strict';

import fs from 'fs';
import path from 'path';
import { error } from 'console';

import CONFIG from '../config.js';
import projectItem from '../items/projectItem.js';
import moduleItem from '../items/moduleItem.js';
import moduleBuilderFoundry from './moduleBuilderFoundry.js';

import { createDirectory, cloneDirectories, readDataFile, writeDataFile } from "../lib/filesystem.js";

class moduleBuilder {
  project;
  module;
  options;
  builder;

  /**
   * 
   * @param {projectItem} project 
   * @param {moduleItem} module 
   * @param {Array} options 
   */
  constructor(project, module, options) {
    this.project = project;
    this.module = module;
    this.options = options;
    
    if (options && options.vtt && options.vtt != '') {
      this.module.vtt = options.vtt;
      this.module.path = options.location;
    }
  }

  /**
   * 
   */
  async build() {
    // Create builder if needed
    if (this.module.vtt != '') {
      switch(this.module.vtt) {
        case 'foundry': this.builder = new moduleBuilderFoundry();
      }

      if (!this.module.path || this.module.path == '' || !fs.existsSync(this.module.path))
        throw error(`Invalid location ${this.module.path} for ${this.module.vtt}`);
    }

    // Does module location exists?
    this.createOutputDirectories(this.project, this.module); 
    let buildPath = path.resolve(path.join(this.project.path,CONFIG.buildPath,this.module.name));     // project/obj/module
    let outputPath = path.resolve(path.join(this.project.path,CONFIG.outputPath,this.module.name));   // project/dist/module
    let modulePath = path.resolve(path.join(this.project.path,CONFIG.modulePath,this.module.name));   // project/mods/module
    
    // Read module configuration
    console.log(` - Building module ${this.module.name} ... reading ${path.resolve(path.join(modulePath, CONFIG.moduleFile))}`);
    let moduleData = await readDataFile(path.resolve(path.join(modulePath, CONFIG.moduleFile)));
    console.log(` - Building module ${this.module.name} ... ${moduleData.module.id} (${moduleData.module.version})`);
    let moduleVersion = this.increaseVersion(moduleData.module.version, this.options);
    if (moduleData.version != moduleVersion) {
      console.log(` - Building module ${this.module.name} ... updating to '${moduleVersion}'`);
    }

    // Write new module configuration
    if (moduleData.module.version != moduleVersion) {
      console.log(` - Building module ${this.module.name} ... updating configuration`);
      writeDataFile(path.resolve(path.join(modulePath, CONFIG.moduleFile)));
    }

    // Actions for VTT BEFORE
    console.log(` - Building module ${this.module.name} ... before build`);
    if (this.builder) {
      await this.builder.beforeBuild(this.project, this.module, buildPath, outputPath, modulePath);
    }
    
    // Actions for VTT POST
    console.log(` - Building module ${this.module.name} ... creating build`);
    if (this.builder) {
      await this.builder.createBuild(this.project, this.module, buildPath, outputPath, modulePath);
    }

    // Actions for VTT POST
    console.log(` - Building module ${this.module.name} ... after build`);
    if (this.builder) {
      await this.builder.postBuild(this.project, this.module, buildPath, outputPath, modulePath);
    }

    // Actions for OUTPUT
    console.log(` - Building module ${this.module.name} ... creating output`);
    if (this.builder) {
      await this.builder.createOutput(this.project, this.module, buildPath, outputPath, modulePath);
    }

    console.log(` - Building module ${this.module.name} ... finished`);
  }

  /**
   * Builds the build and output paths for the module
   * @param {projectItem} project 
   * @param {moduleItem} module 
   */
  createOutputDirectories(project, module) {
    let checkPath = path.resolve(path.join(project.path,CONFIG.modulePath,module.name));
    if (!fs.existsSync(checkPath))
      throw error(`Invalid path ${modulePath} for module ${module.name}`);

    // Build path
    checkPath = path.join(project.path, CONFIG.buildPath);
    if (!fs.existsSync(checkPath))
      createDirectory(checkPath);

    // Build path module
    checkPath = path.join(checkPath, module.name);
    if (!fs.existsSync(checkPath))
      createDirectory(checkPath);

    // Dist path
    checkPath = path.join(project.path, CONFIG.outputPath);
    if (!fs.existsSync(checkPath))
      createDirectory(checkPath);

    // Dist path module
    checkPath = path.join(checkPath, module.name);
    if (!fs.existsSync(checkPath))
      createDirectory(checkPath);
  }

  /**
   * 
   * @param {string} semver 
   * @param {Array} options 
   * @returns the new semver
   */
  increaseVersion(semver, options) {
    if (options && options.version && options.version != '') {
      let versions = semver.split(".");
      if (options.version.toLowerCase() == 'build') {
        versions[2] = Number(versions[2]) + 1;
      } else if (options.version.toLowerCase() == 'minor') {
        versions[1] = Number(versions[1]) + 1;
        versions[2] = 1;
      } else if (options.version.toLowerCase() == 'major') {
        versions[0] = Number(versions[0]) + 1;
        versions[1] = 1;
        versions[2] = 1;
      }
      if ((options.version.toLowerCase() == 'build')
      || (options.version.toLowerCase() == 'minor')
      || (options.version.toLowerCase() == 'major')) {
        semver = versions.join(".")
      }
    }
    return semver;
  }
}

export default moduleBuilder;