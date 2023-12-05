'use strict';

import CONFIG from '../config.js';

class projectCommands {
  controller;

  /**
   * 
   * @param {Array} commands 
   */
  constructor(commands) {
    this.controller = CONFIG.projectController;

    const cmdNew = (commands['new']).command('project');
    cmdNew
      .argument('<project>', 'Name of the project')
      .option('-t, --template <template>', 'Selected template', 'new-project')
      .option('-f, --folder <folder>', 'Selected path', CONFIG.currentWorkPath)
      .description('Creates a new project in the working directory')
      .action( async (project, options) => { await this.create(project, options); });
  }

  /**
   * @param {string} project 
   * @param {object} options [template]
   */
  async create(project, options) {
    console.log(`Creating project ${project} from template ${options.template}`);
    let item = await this.controller.create(project, options);
    if (item) {
      
    }
  }
}

export default projectCommands;