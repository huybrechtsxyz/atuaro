import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';
import JSZip from 'jszip';
import { error } from 'console';

/**
 * 
 * @param {string} source 
 * @param {string} target 
 * @param {boolean} recursive 
 */
export function cloneDirectories(source, target, recursive = true) {
  if (!fs.existsSync(source))
    throw error('   ! Invalid source path defined ' + source);
  for(const item of fs.readdirSync(source)) {
    var asset = path.join(source, item);
    var stat = fs.statSync(asset);
    if (stat.isDirectory() && recursive) {
      var newdir = createDirectory(path.join(target,item));
      cloneDirectories(asset, newdir);
    }
    else if (stat.isFile()) {
      var file = path.join(target, item);
      if (!fs.existsSync(file)) {
        fs.copyFileSync(asset, file);
      }
    }
  }
}

/**
 * 
 * @param {string} folder 
 * @returns string folder
 */
export function createDirectory(folder) {
  if (!fs.existsSync(folder)) {
    fs.mkdirSync(folder);
  }
  return folder;
}

/**
 * ASYNC !
 * @param {string} filename 
 * @returns JSON
 */
export async function readDataFile(filename) {
  switch(path.extname(filename).toLowerCase()) {
    case '.json':
      return await readJsonFile(filename);
    case '.yaml':
      return await readYamlFile(filename);
    default:
      throw error(`Invalid file type for ${filename}`);
  } 
}

/**
 * 
 * @param {string} fileName 
 * @returns JSON
 */
export async function readJsonFile(fileName) {
  return await JSON.parse(fs.readFileSync(new URL('file://' + fileName, import.meta.url), 'utf-8'));
}

/**
 * 
 * @param {string} filename 
 * @returns JSON
 */
export async function readYamlFile(filename) {
  return await yaml.load(fs.readFileSync(filename, 'utf8'));
}

/**
 * 
 * @param {string} filename 
 * @param {object} data 
 */
export function writeDataFile(filename, data) {
  switch(path.extname(filename).toLowerCase()) {
    case '.json':
      writeJsonFile(filename, data); break;
    case '.yaml':
      writeYamlFile(filename, data); break;
    default:
      throw error(`Invalid file type for ${filename} with ext '${path.extname(filename).toLowerCase()}'`);
  } 
}

/**
 * 
 * @param {string} filename 
 * @param {object} data 
 */
export function writeJsonFile(filename, data) {
  fs.writeFileSync(filename, JSON.stringify(data), err => { if (err) { throw err; } });
}

/**
 * 
 * @param {string} filename 
 * @param {object} data 
 */
export function writeYamlFile(filename, data) {
  fs.writeFileSync(filename, yaml.dump(data), 'utf8');
}

/**
 * ASYNC. Saves a folder as zip. Use fullpaths! 
 * @param {string} pathToZip 
 * @param {string} saveAsFile 
 */
export async function zipFolder(pathToZip, saveAsFile) {
  let cwd = process.cwd();
  process.chdir(pathToZip);
  let zip = new JSZip();
  zip = await addToZip('.', zip);
  await zip.generateAsync({type:"blob"}).then(async function(content) {
    let readableStream = content.stream();
    let stream = readableStream.getReader();
    let writestream = fs.createWriteStream(saveAsFile);
    while (true) {
      let { done, value } = await stream.read();
      if (done) { break; }
      writestream.write(value);
    }
    writestream.close();
  });
  process.chdir(cwd);
}

/**
 * ASYNC.
 * @param {string} pathToZip 
 * @param {JSZip} zip 
 * @param {boolean} recursive 
 * @param {string} indentation 
 * @returns 
 */
async function addToZip(pathToZip, zip, recursive = true, indentation = '       ') {
  if (!fs.existsSync(pathToZip))
    throw error('   ! Invalid source path defined');
  for(const item of fs.readdirSync(pathToZip)) {
    var asset = path.join(pathToZip, item);
    var stat = fs.statSync(asset);
    if (stat.isDirectory() && recursive) {
      //console.log(indentation + '/' + asset);
      let zipped = zip.folder(asset);
      await addToZip(asset, zipped, recursive, indentation + '   ');
    }
    else if (stat.isFile()) {
      //console.log(indentation + '- ' + asset);
      var content = fs.readFileSync(asset);
      await zip.file(asset, content);
    }
  }
  return zip;
}