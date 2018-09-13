const Conf = require('conf');
const EM = require('events');

/** Class helper for reading and writing to the conf file. */
class ConfHelper {
  /**
   * Initalise file.
   * @param {string} cn - config name, without extension. Default: 'ignis'
   * @param {string} fe - file extension. Default: 'conf'
   * @param {string} loc - file location, from current location. Default '.'
   */
  constructor(cn='',fe='conf',loc='.') {
    this.events = new EM.EventEmitter();
    this.config = new Conf({configName: cn, fileExtension: fe, cwd: loc});
    this.conf   = this.config.get();
  }
  /** 
   * Update `this.conf` and trigger event. 
   * @event change
   * @private
   */
  _getConf(key = '', type) {
    this.conf = this.config.get();
    if(type) this.events.emit('change', key, type);
  }
  /** Create new key. */
  createKey(key = '', val) {
    if (this.config.has(key)) throw `${key} already exists, please use updateConf`
    let keyVal = this.conf;
    let layers = key.split('.');
    let name = layers[layers.length - 1];
    for (let i = 0; i < layers.length - 1; i++) {
      if (!keyVal[layers[i]]) keyVal[layers[i]] = {};
      keyVal = keyVal[layers[i]];
    }
    keyVal[name] = val;
    this.config.set(layers[0], this.conf[layers[0]]);
    this._getConf(key, "create");
  }
  /** Delete existing key. */
  deleteKey(key = '') {
    if (!this.config.has(key)) return
    this.config.delete(key);
    this._getConf(key, "delete");
  }
  /** Update existing key. */
  updateKey(key = '', val) {
    if (!this.config.has(key)) throw `${key} does not exists please use createConf`
    if (this.config.get(key) === val) return
    this.config.set(key, val);
    this._getConf(key, "update");
  }
}

module.exports = ConfHelper;