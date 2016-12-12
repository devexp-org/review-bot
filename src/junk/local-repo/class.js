import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';

export default class LocalRepo {

  constructor(host, info) {
    this.host = host;
    this.info = info;
  }

  /**
   * Returns path for your local repo copy
   *
   * @param {String}   name
   *
   * @return {String}
   */
  getRepoLocalPath(name) {
    return path.resolve(__dirname, '..', '..', '..', 'tmp', name.split('/')[1]);
  }

  /**
   * Exec wrapper for testing
   *
   * @param {String} cmd
   * @param {Function} cb
   *
   * @return {Object}
   */
  _exec(cmd, cb) {
    return exec(cmd, cb);
  }

  /**
   * Execute external programm
   *
   * @param {String}   cmd
   *
   * @return {Promise}
   */
  _execCommand(cmd) {
    const info = this.info;

    return new Promise((resolve, reject) => {
      const child = this._exec(cmd, (err, stdout, stderr) => {
        if (err) {
          reject(err);
          return;
        }

        info(stdout);
        info(stderr);
      });

      child.on('message', (msg) => info(msg));

      child.on('close', function (code) {
        Number(code) === 0 ? resolve() : reject(new Error(`Exit code ${code}`));
      });
    });
  }

  /**
   * git clone
   *
   * @param {String}   name - repo name
   *
   * @return {Promise}
   */
  clone(name) {
    this.info(`Cloning ${name} repo.`);

    return this._execCommand(`git clone ${this.host}/${name}.git ${this.getRepoLocalPath(name)}`);
  }

  /**
   * git pull
   *
   * @param {String}   name - repo name
   *
   * @return {Promise}
   */
  pull(name) {
    this.info(`Pulling ${name} repo.`);

    return this._execCommand(`cd ${this.getRepoLocalPath(name)}; git pull`);
  }

  /**
   * Check repo local copy and pull or clone it
   *
   * @param {String}   name
   *
   * @return {Promise}
   */
  update(name) {
    return new Promise(resolve => {
      fs.lstat(this.getRepoLocalPath(name), (err, stat) => {
        if (!err && stat && stat.isDirectory()) {
          return this.pull(name);
        } else {
          return this.clone(name);
        }
      });
    });
  }

}
