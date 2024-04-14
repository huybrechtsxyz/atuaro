import path from 'path';
import figlet from 'figlet';
import { Command } from 'commander';

import { fileURLToPath } from 'url';
import { readDataFile } from './lib/filesystem.js';
import configCommands from './commands/configCommands.js';
import CONFIG from './lib/config.js';

/**
 * 
 */
async function start() {
  const cwdPath = process.cwd();
  const appPath = path.resolve(path.dirname(fileURLToPath(import.meta.url)));
  const packageFile = path.resolve(path.join(appPath, './package.json'));
  const packageData = await readDataFile(packageFile);
  console.log(figlet.textSync(packageData.title));
  console.log('Description: ' + packageData.description);
  console.log(' - Work path: ' + cwdPath);
  console.log(' - App path: ' + appPath);
  console.log('');

  const projectFile = path.resolve(path.join(cwdPath, './package.json'));
  const projectData = await readDataFile(projectFile);
  if (!projectData) {
    console.warn('Execute the program from the root of the package, e.g.,')
    console.log('   newproject> ./node_modules/.bin/rpgtools.xyz.cmd init');
    return;
  } else if (!projectData.name) {
    console.warn('Your package requires a name attribute for safety purposes, e.g.,')
    console.log('   Add "name": "<your name here>" in the package.json');
    return;
  }

  console.log('About ' + ( projectData.title ?? projectData.name ));
  if (projectData.name)
    console.log(' - Name: ' + projectData.name);
  if (projectData.version)
    console.log(' - Version: ' + projectData.version);
  if (projectData.description)
    console.log(' - Description: ' + projectData.description);
  CONFIG.projectData = projectData;
  console.log('');
  
  await CONFIG.initialize(appPath, cwdPath);
  const program = new Command();
  program
    .name(packageData.title)
    .version(packageData.version);

  let commands = {
    init: program.command('init')
  };

  let subcommands = {
    config: new configCommands(commands)
  };

  await program.parseAsync(process.argv);
  await CONFIG.dispose();
  console.log('');
}

export default start;