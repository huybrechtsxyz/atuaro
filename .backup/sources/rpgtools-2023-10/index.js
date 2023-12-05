import path from 'path';
import figlet from 'figlet';
import { Command } from 'commander';

import { fileURLToPath } from 'url';
import { readDataFile } from './lib/filesystem.js';
import projectCommands from './commands/projectCommands.js';
import CONFIG from './config.js';

async function start() {
  const cwdPath = process.cwd();
  const appPath = path.resolve(path.dirname(fileURLToPath(import.meta.url)));
  const packageFile = path.resolve(path.join(appPath, './package.json'));
  const packageData = readDataFile(packageFile);
  console.log(figlet.textSync(packageData.title));
  console.log('Description: ' + packageData.description);
  console.log(' - Work path: ' + cwdPath);
  console.log(' - App path: ' + appPath);
  console.log('');

  await CONFIG.initialize(appPath, cwdPath);
  const program = new Command();
  program
    .name(packageData.title)
    .version(packageData.version);

  let commands = {
    list: program.command('list'),
    get: program.command('get'),
    new: program.command('new'),
    add: program.command('add'),
    set: program.command('set'),
    del: program.command('remove'),
    bld: program.command('build'),
  };

  let subcommands = {
    project: new projectCommands(commands)
  };

  await program.parseAsync(process.argv);
  await CONFIG.dispose();
  console.log('');
}

export default start;