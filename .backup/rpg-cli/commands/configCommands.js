'use strict';

import CONFIG from '../lib/config.js';
import readline from "readline";

class configCommands {
  controller;

  constructor(commands) {
    this.controller = CONFIG.configController;

    const cmdInit = (commands['init'])
    cmdInit
      .option('-t, --template <template>', 'Selected template', 'new-project')
      .description('Initializes a new project in the working directory')
      .action( async (options) => { await this.init(options); });
  }

  /**
   * 
   * @param {string} name 
   * @param {Array} options : template
   */
  async init(options) {
    console.log('Initializing project with template ' + options.template);
    let inited = await this.controller.isInitialized();
    if (inited) {
      const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
      });
      console.log(' - target: ' + CONFIG.currentWorkPath);
      rl.question('Target directory is already initialized, overwrite? (Y/N)', function(overwrite) {
        if (overwrite.toUpperCase() != "Y" && overwrite.toUpperCase() != "YES") {
          return;
        }
        rl.close();
      });      
    }
    let result = await this.controller.create(options);
    console.log(' - template: ' + this.controller.template);
    console.log(' - target: ' + CONFIG.currentWorkPath);
    if (result) console.log(` - ${this.controller.status}`);
    else console.warn(` - WARNING: ${this.controller.status}`);
  }
}

export default configCommands;