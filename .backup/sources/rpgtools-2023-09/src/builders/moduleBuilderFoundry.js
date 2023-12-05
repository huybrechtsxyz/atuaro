'use strict';

import fs from 'fs';
import path from 'path';
import CONFIG from '../config.js';

import projectItem from '../items/projectItem.js';
import moduleItem from '../items/moduleItem.js';
import { transform } from '../lib/jsondata.js';
import { copyFile, createDirectory, cloneDirectories, zipFolder, readDataFile, writeDataFile } from "../lib/filesystem.js";

class moduleBuilderFoundry {

  /**
   * 
   * @param {projectItem} project 
   * @param {moduleItem} module 
   * @param {string} buildPath (obj)
   * @param {string} outputPath (dist)
   * @param {string} modulePath (mods)
   */
  async beforeBuild(
    project,
    module,
    buildPath,
    outputPath,
    modulePath
  ) {
    console.log(` - Building module ${module.name} FoundryVTT ... before build`);

    // Copy foundry data to mods
    this.before_copyFoundryDataToMods(module, modulePath);
    
    console.log(` - Building module ${module.name} FoundryVTT ... before build finished`);
  }

  /**
   * 
   * @param {projectItem} project 
   * @param {moduleItem} module 
   * @param {string} buildPath (obj)
   * @param {string} outputPath (dist)
   * @param {string} modulePath (mods)
   */
  async createBuild(
    project,
    module,
    buildPath,
    outputPath,
    modulePath
  ) {
    console.log(` - Building module ${module.name} FoundryVTT ... create build`);

    // Copy mods data to output
    this.create_copyModsDataToOutput(module, modulePath, buildPath);

    // Copy mods assets to output
    this.create_copyModsAssetsToOutput(module, modulePath, buildPath);

    // Create the module json path
    await this.create_makeModuleManifest(module, modulePath, buildPath);

    console.log(` - Building module ${module.name} FoundryVTT ... create build finished`);
  }
    
  /**
     * 
     * @param {projectItem} project 
     * @param {moduleItem} module 
     * @param {string} buildPath (obj)
     * @param {string} outputPath (dist)
     * @param {string} modulePath (mods)
     */
  async postBuild(
    project,
    module,
    buildPath,
    outputPath,
    modulePath
  ) {
    console.log(` - Building module ${module.name} FoundryVTT ... after build`);

    // Copy assets OBJ to FOUNDRY
    this.post_copyOutputAssetsToFoundry(module, buildPath);    

    console.log(` - Building module ${module.name} FoundryVTT ... after build finished`);
  }

  /**
   * 
   * @param {projectItem} project 
   * @param {moduleItem} module 
   * @param {string} buildPath (obj)
   * @param {string} outputPath (dist)
   * @param {string} modulePath (mods)
   */
  async createOutput(
    project,
    module,
    buildPath,
    outputPath,
    modulePath
  ) {
    console.log(` - Building module ${module.name} FoundryVTT ... create output`);

    // Copy new module file
    await this.output_copyManifestFile(project, module);

    // Create Module Zip
    await this.ouput_createModuleZip(project, module);

    console.log(` - Building module ${module.name} FoundryVTT ... create output finished`);
  }

  /**
   * Copy foundry packs to mods (dev)
   */
  before_copyFoundryDataToMods(module, modulePath) {
    console.log(` - Building module ${module.name} FoundryVTT ... copying packs`);
    let source = path.join(module.path,'packs');
    let target = path.join(modulePath,'packs');
    console.log(`    - source: ${source}`);
    console.log(`    - target: ${target}`);
    if (!fs.existsSync(target))
      createDirectory(target);
    cloneDirectories(source, target);
  }

  /**
   * Copy Mods data to Output folder
   */
  create_copyModsDataToOutput(module, modulePath, buildPath) {
    console.log(` - Building module ${module.name} FoundryVTT ... copying packs`);
    let source = path.join(modulePath,'packs');
    let target = path.join(buildPath,'packs');
    console.log(`    - source: ${source}`);
    console.log(`    - target: ${target}`);
    if (!fs.existsSync(target))
      createDirectory(target);
    cloneDirectories(source, target);
  }

  /**
   * Copy Mods assets to Output folder
   */
  create_copyModsAssetsToOutput(module, modulePath, buildPath) {
    console.log(` - Building module ${module.name} FoundryVTT ... copying assets`);
    let source = path.join(modulePath,CONFIG.assetsPath);
    let target = buildPath;
    console.log(`    - source: ${source}`);
    console.log(`    - target: ${target}`);
    cloneDirectories(source, target);
  }

  /**
   * Create module manifest
   * @param {moduleItem} module 
   * @param {string} modulePath 
   * @param {string} buildPath 
   */
  async create_makeModuleManifest(module, modulePath, buildPath) {
    console.log(` - Building module ${module.name} FoundryVTT ... creating module.json`);
    let source = path.join(modulePath, 'module.yaml');
    let target = path.join(modulePath, 'module.json');
    let output = path.join(buildPath, 'module.json');
    if (fs.existsSync(source) && fs.existsSync(target)) {
      var sourceData = await readDataFile(source);
      var targetData = await readDataFile(target);
      transform(targetData, sourceData);
      writeDataFile(output, targetData);
    }
  }

  /**
   * Copy output assets back to foundry
   * @param {moduleItem} module 
   * @param {string} buildPath 
   */
  post_copyOutputAssetsToFoundry(module, buildPath) {
    console.log(` - Building module ${module.name} FoundryVTT ... copying assets`);
    let source = buildPath;
    let target = module.path;
    console.log(`    - source: ${source}`);
    console.log(`    - target: ${target}`);
    cloneDirectories(source, target);
  }

  /**
   * Copy module manifest to output
   * @param {projectItem} project 
   * @param {moduleItem} module 
   */
  async output_copyManifestFile(project, module) {
    console.log(` - Building module ${module.name} FoundryVTT ... module.json`);
    let source = path.join(project.path, CONFIG.buildPath, module.name, "module.json");
    let target = path.join(project.path, CONFIG.outputPath, module.name, "module.json");
    console.log(`    - source: ${source}`);
    console.log(`    - target: ${target}`);
    if (fs.existsSync(source))
      copyFile(source, target, true);
  }

  /**
   * Creating module package
   * @param {projectItem} project 
   * @param {moduleItem} module 
   */
  async ouput_createModuleZip(project, module) {
    console.log(` - Building module ${module.name} FoundryVTT ... zipping`);
    let source = path.join(project.path, CONFIG.buildPath, module.name);
    let target = path.join(project.path, CONFIG.outputPath, module.name, "module.zip");
    console.log(`    - folder: ${source}`);
    console.log(`    - zip: ${target}`);
    await zipFolder(source, target);
  }
}

export default moduleBuilderFoundry;