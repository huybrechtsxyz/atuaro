// Imports
import fs from 'fs';
import fsp from 'fs/promises';
import path from 'path';
import yaml from 'js-yaml';
import { error } from 'console';

export const _MARKUP = {};
  _MARKUP['ASCIIDOC'] = "ASCIIDOC";
  _MARKUP['ASCIDOC'] = "ASCIIDOC";
  _MARKUP['ADOC'] = "ASCIIDOC";
  _MARKUP['MARKDOWN'] = "MARKDOWN";
  _MARKUP['MD'] = "MARKDOWN";
  _MARKUP['README'] = "MARKDOWN";
  _MARKUP['PLAINTEXT'] = "TEXT";
  _MARKUP['TEXT'] = "TEXT";
  _MARKUP['TXT'] = "TEXT";

export function getFilename(source, format) {
  switch(_MARKUP[format.toUpperCase()]){
    case 'ASCIIDOC':
      return source + '.adoc';
    case 'MARKDOWN':
      return source + '.md';
    case 'TEXT':
      return source + '.txt';
    default:
      throw error(`Invalid format ${format} for ${_MARKUP}`);
  }
}

/**
 * @param {fs.PathLike} folder
 */
export function createDirectory(folder){
  if (!fs.existsSync(folder)) {
    fs.mkdirSync(folder);
  }
  return folder;
}

/**
 * @param {string} sourcePath
 * @param {string} targetPath
 * @var {string} subPath
 */
export function copyDirectories(sourcePath, targetPath) {
  if (!fs.existsSync(sourcePath)) {
    console.log('   ! Invalid source path defined');
  }

  const items = fs.readdirSync(sourcePath);
  for(const itemname of items) {
    var fullPath = path.join(sourcePath, itemname);
    var stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      var subPath = createDirectory(path.join(targetPath,itemname));
      copyDirectories(fullPath, subPath);
    } else if (stat.isFile()) {
      var filePath = path.join(targetPath, itemname);
      if (!fs.existsSync(filePath)) {
        fs.copyFileSync(fullPath, filePath);
      }
    }
  }
}

// Read JSON file
/**
 * @param {string} fileName
 */
 export async function readJsonFile(fileName) {
  try {
    let fileJSON = JSON.parse(await fsp.readFile(new URL('file://' + fileName, import.meta.url), 'utf-8'));
    return fileJSON;
  }
  catch(e) {
    console.error(e);
  }
}

// Write JSON file
/**
 * @param {string} folder
 * @param {string} filename
 * @param {object} data
 */
export function writeJsonFile(folder, filename, data) {
  fs.writeFile(path.join(folder, filename), JSON.stringify(data), err => { if (err) { throw err; } });
}

// Merge 2 Json Objects
export function mergeJsonData(data1, data2)
{
  return {...data1, ...data2};
}

// Read YAML file
/**
 * @param {string} fileName
 */
export function readYamlFile(filename) {
  let fileContents = fs.readFileSync(filename, 'utf8');
  let data = yaml.load(fileContents);
  return data;
}

// Write YAML file
/**
 * @param {string} folder
 * @param {string} filename
 * @param {object} data
 */
export function writeYamlFile(folder, filename, data) {
  let yamlData = yaml.dump(data);
  fs.writeFileSync(path.join(folder, filename), yamlData, 'utf8');
}

// READ DATA FILE
export function readDataFile(filename) {
  switch(path.extname(filename).toLowerCase()) {
    case '.json':
      return readJsonFile(filename);
    case '.yaml':
      return readYamlFile(filename);
    default:
      throw error(`Invalid file type for ${filename}`);
  } 
}

// WRITE DATA FILE
export function writeDataFile(folder, filename, data) {
  switch(path.extname(filename).toLowerCase()) {
    case '.json':
      writeJsonFile(folder, filename, data);
    case '.yaml':
      writeYamlFile(folder, filename, data);
    default:
      throw error(`Invalid file type for ${filename}`);
  } 
}