'use strict';

import CONFIG from '../config.js';
import { Option } from 'commander';

class worldCommands {
  controller;
  
  /**
   * @param {command} commands 
   */
  constructor(commands) {
    this.controller = CONFIG.worldController;
    this.load(commands);
  }

  /**
   * @param {command} commands 
   */
  load(commands) {
    const cmdList = (commands['list']).command('world');
    cmdList
      .option('-p, --project <project>', 'Selected project')
      .description('List the known worlds (for a project)')
      .action( async (options) => { await this.list(options); });

    const cmdGet = (commands['get']).command('world');
    cmdGet
      .argument('[world]', 'Name of the world')
      .option('-p, --project <project>', 'Selected project')
      .description('Display world information')
      .action( async (world, options) => { await this.get(world, options); });

    const cmdNew = (commands['new']).command('world');
    cmdNew
      .argument('<world>', 'Name of the world')
      .option('-p, --project <project>', 'Selected project')
      .option('-t, --template <template>', 'Selected template', 'new-world')
      .addOption(new Option('-vtt, --vtt <vtt>', 'Selected virtual table top').choices(['foundry']))
      .option('-l, --location <location>', 'Selected folder for the vtt world')
      .description('Creates a new world for the selected project')
      .action( async (world, options) => { await this.create(world, options); });

    const cmdAdd = (commands['add']).command('world');
    cmdAdd
      .argument('<world>', 'Name of the world')
      .option('-p, --project <project>', 'Selected project')
      .addOption(new Option('-vtt, --vtt <vtt>', 'Selected virtual table top').choices(['foundry']))
      .option('-l, --location <location>', 'Selected folder for the vtt world')
      .description('Add an existing world to the project')
      .action( async (world, options) => { await this.add(world, options); });

    const cmdSet = (commands['set']).command('world');
    cmdSet
      .argument('<world>', 'Name of the world')
      .option('-p, --project <project>', 'Selected project')
      .addOption(new Option('-vtt, --vtt <vtt>', 'Selected virtual table top').choices(['foundry']))
      .option('-l, --location <location>', 'Selected folder for the vtt world')
      .description('Update world information')
      .action( async (world, options) => { await this.set(world, options); });

    const cmdDel = (commands['del']).command('world');
    cmdDel
      .argument('<world>', 'Name of the world')
      .option('-p, --project <project>', 'Selected project')
      .description('Removes the world from the project')
      .action( async (world, options) => { await this.remove(world, options); });

    const cmdSync = (commands['build']).command('world');
    cmdSync
      .argument('[world]', 'Name of the world')
      .option('-p, --project <project>', 'Selected project')
      .addOption(new Option('-v, --version <version>', 'Increment world version').choices(['build', 'minor', 'major']))
      .addOption(new Option('-vtt, --vtt <vtt>', 'Selected virtual table top').choices(['foundry']))
      .option('-l, --location <location>', 'Selected folder for the vtt world')
      .description('Builds the world information')
      .action( async (world, options) => { await this.build(world, options); });
  }

  /**
   * @param {Array} options 
   */
  async list(options) {
    console.log(`Retrieving worlds from collection`);
    let values = await this.controller.list(options);
    this.printList(values);
  }

  /**
   * @param {string} world 
   * @param {Array} options 
   */
  async get(world, options) {
    world = await this.controller.getworldName(world);
    console.log(`Retrieving world ${world} from collection`);
    let value = await this.controller.get(world, options);    
    if (value)
      await CONFIG.setConfig({ project: value.project, world: value.name });
    this.printValues(value, ` - WARNING: world ${world} for ${await this.controller.getProjectName(options)} not found`);
  }

  /**
   * @param {string} world 
   * @param {Array} options 
   */
  async create(world, options) {
    console.log('Creating world ' + world + ' with template ' + options.template);
    options = await this.controller.validate(world, options, true);
    console.log(' - target: ' + options.folder);
    let value = await this.controller.create(world, options, true);
    if (value)
      await CONFIG.setConfig({ project: value.project, world: value.name });
    this.printValues(value, ` - WARNING: world ${world} for project ${options.project} already exists`);
  }

  /**
   * @param {string} world 
   * @param {Array} options 
   */
  async add(world, options) {
    console.log('Adding world ' + world + ' to collection');
    options = await this.controller.validate(world, options, false);
    console.log(' - target: ' + options.folder);
    let value = await this.controller.create(world, options, false);
    if (value)
      await CONFIG.setConfig({ project: value.project, world: value.name });
    this.printValues(value, ` - WARNING: world ${world} for project ${options.project} already exists`);
  }

  /**
   * @param {string} world 
   * @param {Array} options 
   */
  async set(world, options) {
    console.log('Updating world ' + world + ' in collection');
    options = await this.controller.validate(world, options, false);
    let value = await this.controller.update(world, options);
    if (value)
      await CONFIG.setConfig({ project: value.name, world: value.name });
    this.printValues(value, ` - WARNING: world ${world} for project ${options.project} does not exists`);
  }

  /**
   * @param {string} world 
   * @param {Array} options 
   */
  async remove(world, options) {
    console.log('Removing world ' + world + ' from collection');
    let value = await this.controller.remove(world, options);
    if (value)
      await CONFIG.setConfig({ project: value.name, world: value.name });
    this.printValues(value, ` - WARNING: world ${world} for project ${options.project} does not exists`);
  }

  /**
   * @param {string} world 
   * @param {Array} options 
   */
  async build(world, options) {
    world = await this.controller.getworldName(world);
    console.log('Building world ' + world + ' from collection');
    options = await this.controller.validate(world, options, false);
    let value = await this.controller.build(world, options);
    if (value)
      await CONFIG.setConfig({ project: value.name, world: value.name });
    this.printValues(value, ` - WARNING: world ${world} for project ${options.project} does not exists`);
  }

  /**
   * @param {Array} values
   */
  printList(values) {
    if (values && values.length>0) {
      for (var item in values) {
        console.log(` - ${values[item].name} \t\t (${values[item].project})`);
      }
    } else 
      console.log(` - No worlds where found`);
  }

  /**
   * @param {Array} value
   * @param {string} warning 
   * @
   */
  printValues(value, warning) {
    if (value) {
      for (var member in value) {
        if (!value.hasOwnProperty(member) || typeof(value[member]) === "function") continue;
        console.log(` - ${member}: ${value[member]}`);
      }
    } else
      console.log(warning);
  }
}

export default worldCommands;