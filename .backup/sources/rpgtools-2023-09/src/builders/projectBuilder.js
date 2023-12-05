'use strict';

import CONFIG from '../config.js';

class projectBuilder {
  project;
  options;

  /**
   * 
   * @param {projectItem} project 
   * @param {moduleItem} module 
   * @param {Array} options 
   */
  constructor(project, options) {
    this.project = project;
    this.options = options;
  }

  /**
   * 
   */
  async build() {
    // MODULES
    let modules = await CONFIG.moduleController.list({project: this.project});
    console.log(` - Building modules ...`);
    if (modules && modules.length > 0) {
      for (var member in modules) {
        await CONFIG.moduleController.build( modules[member].name, { project: this.project });
      }
      console.log(` - Building modules ... finished`);
    } else 
      console.log(` - Building modules ... no modules found`);

    // WORLDS
    let worlds = await CONFIG.worldController.list({project: this.project});
    console.log(` - Building worlds ... `);
    if (worlds && worlds.length > 0) {
      for (var member in worlds) {
        await CONFIG.worldController.build( worlds[member].name, { project: this.project });
      }
      console.log(` - Building worlds ... finished`);
    } else 
      console.log(` - Building worlds ... no worlds found`);
  }
}

export default projectBuilder;