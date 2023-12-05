'use strict';

import CONFIG from '../config.js';

class configCommands {
  controller;
  
  /**
   * @param {command} commands 
   */
  constructor(commands) {
    this.controller = CONFIG.configController;
    this.load(commands);
  }

  /**
   * @param {command} commands 
   */
  load(commands) {
    const cmdGet = (commands['get']).command('config');
    cmdGet
      .description('Display the configuration')
      .action( async () => { await this.get(); });

    const cmdSet = (commands['set']).command('config');
    cmdSet
      .option('-p, --project <project>', 'Selected project')
      .option('-m, --module <module>', 'Selected module')
      .option('-w, --world <world>', 'Selected world')
      .description('Update the configuration')
      .action( async (options) => { await this.set(options); });
  }

  /**
   */
  async get() {
    console.log(`Retrieving default configuration`);
    let value = await this.controller.read();
    if (value) {
      for (var member in value) {
        if (!value.hasOwnProperty(member) || typeof(value[member]) === "function") continue;
        console.log(` - ${member}: ${value[member]}`);
      }
    } else
      console.log(` - WARNING: Defaults not found`); 
  }

  /**
   * @param {Array} options 
   */
  async set(options) {
    console.log(`Storing default configuration`);
    if (options && Object.keys(options).length>0) {
      try{
        let value = await this.controller.save(options);
        if (value) {
          for (var member in value) {
            if (!value.hasOwnProperty(member) || typeof(value[member]) === "function") continue;
            console.log(` - ${member}: ${value[member]}`);
          }
        } 
      } catch(error) {
        console.error(error); 
      }
    } else {
      console.log(` - WARNING: Defaults not set`);
    }
  }
}

export default configCommands