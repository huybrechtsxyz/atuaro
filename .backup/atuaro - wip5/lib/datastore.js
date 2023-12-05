'use-strict';

import { Level } from 'level';
import { error } from 'console';

class Datastore {
  db
  name;
  
  /**
   * 
   * @param {string} baseDir 
   * @param {string} dbname 
   * @param {JSON} valueEncoding 
   */
  constructor(baseDir, dbname, valueEncoding = { valueEncoding: 'json' }) {
    //console.debug(`Constructing database ${dbname} in ${baseDir}`);
    this.name = dbname;
    this.db = new Level(baseDir + '/' + dbname, valueEncoding);
  }

  /**
   * 
   * @returns bool if opened
   */
  async open() {
    try {
      //console.debug(`Initializing and opening database ${this.name}`);
      await this.db.open();
      return this.isOpen();
    }
    catch(error) {
      throw error;
    }
  }

  /**
   * 
   * @returns bool if closed
   */
  async close() {
    try {
      await this.db.close();
      return true;
    }
    catch(error) {
      throw error;
    }
  }

  /**
   * 
   * @returns bool if database is open
   */
  isOpen() {
    if(this.db)
      return (this.db.status == 'open');
    else
      return false;
  }

  /**
   * 
   * @param {string} key 
   * @returns object
   */
  async findOne(key) {
    if (!this.isOpen())
      throw error(`Collection ${this.name} is not initialized`);
    try {
      return await this.db.get(key);
    } catch (error) {
      if (error && error.code === 'LEVEL_NOT_FOUND')
        return null;
      else
        throw error;
    }
  }

  /**
   * 
   * @returns all values of the database
   */
  async findAll() {
    return await this.db.values({}).all(); //filter = {} > All without limit
  }

  /**
   * 
   * @param {string} key 
   * @param {JSON} value 
   * @returns the newly created object or null if already exists
   */
  async create(key, value) {
    if (!this.isOpen())
      throw error(`Collection ${this.name} is not initialized`);
    let item = await this.findOne(key);
    if (item)
      return null;
    await this.db.put(key, value);
    return value;
  }

  /**
   * 
   * @param {string} key 
   * @param {object} value 
   * @returns the modified object or null if key not found
   */
  async modify(key, value) {
    if (!this.isOpen())
      throw error(`Collection ${this.name} is not initialized`);
    let item = await this.findOne(key);
    if (item) {
      await this.db.put(key, value);
      return value;
    }
    return null;
  }

  /**
   * 
   * @param {string} key 
   * @param {object} value 
   * @returns the created or updated object
   */
  async update(key, value) {
    if (!this.isOpen())
      throw error(`Collection ${this.name} is not initialized`);
    await this.db.put(key, value);
    return value;
  }

  /**
   * 
   * @param {string} key 
   * @returns if object was deleted or false if not found
   */
  async remove(key) {
    if (!this.isOpen())
      throw error(`Collection ${this.name} is not initialized`);
    let item = await this.findOne(key);
    if (item) {
      await this.db.del(key);
      return true;
    }
    return false;
  }
}

export default Datastore;