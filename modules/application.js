'use strict';

import path from 'path';

export default class Application {

  static values(object) {
    return Object.keys(object).map(key => object[key]);
  }

  /**
   * @constructor
   *
   * @param {Object} config - application config.
   * @param {String} [basePath] - the path relative to which all modules are located.
   */
  constructor(config, basePath) {
    this.services = config && config.services || {};
    this.startupTimeout = config && config.startup_timeout || 2000;
    this.shutdownTimeout = config && config.shutdown_timeout || 2000;

    this.starting = {};
    this.resolved = {};
    this.teardown = {};

    this.promise = null;
    this.started = false;
    this.executed = false;
    this.basePath = basePath || '.';
    this.awaiting = Object.keys(this.services);

    this._require = this.require.bind(this);
    this._requireDefault = this.requireDefault.bind(this);
  }

  require(modulePath) {

    const realPath = modulePath[0] === '/' ?
      modulePath :
      path.join(this.basePath, modulePath);

    return require(realPath);

  }

  requireDefault(modulePath) {
    let module = this.require(modulePath);

    if (module.__esModule) {
      module = module.default;
    }

    return module;
  }

  /**
   * Run an application.
   *
   * @return {Promise}
   */
  execute() {
    if (this.executed) {
      throw new Error('Cannot execute the application twice');
    }

    try {
      this.checkConstraints();
    } catch (e) {
      return Promise.reject(e);
    }

    return new Promise((resolve, reject) => {
      this.promise = { resolve, reject };
      this.executed = true;
      this.nextRound();
    });
  }

  /**
   * Graceful shutdown an application.
   *
   * @return {Promise}
   */
  shutdown() {
    if (!this.started) {
      throw new Error('The application cannot gracefully shutdown until fully started');
    }

    const promise = [];
    for (const name in this.teardown) {
      promise.push(this.teardown[name]());
    }

    return new Promise((resolve, reject) => {
      const shutdownTimer = setTimeout(() => {
        reject(new Error('Timeout of shutdown exceeded'));
      }, this.shutdownTimeout);

      Promise.all(promise)
        .then(() => {
          clearTimeout(shutdownTimer);
          resolve();
        });
    });
  }

  /**
   * Launching a new round.
   * Each round method checks whitch of services can be started.
   * Trigger deadlock exception when there are no awaiting services and no one of services started in the last round.
   *
   * @private
   */
  nextRound() {
    let startedInThisRound = 0;
    const ignored = [];

    for (let i = 0; i < this.awaiting.length; i++) {
      const name = this.awaiting[i];
      const service = this.services[name];

      if (service.ignore) {
        ignored.push(name);
        continue;
      }

      if (this.checkDependencies(name, service)) {
        startedInThisRound++;
        this.startService(name, service);
      }
    }

    ignored.forEach(name => {
      this.awaiting.splice(this.awaiting.indexOf(name), 1);
    });

    if (this.awaiting.length === 0 && Object.keys(this.starting).length === 0) {
      this.started = true;
      this.promise.resolve(this.resolved);
      return;
    }

    if (startedInThisRound === 0) {
      if (Object.keys(this.starting).length === 0) {
        this.promise.reject(new Error(
          'Circular dependency detected while resolving ' +
            this.awaiting.join(', ')
        ));
      }
    }
  }

  /**
   * Check dependencies of a given service.
   * Return `true` when all dependencies are resolved and `false` otherwise.
   *
   * @private
   *
   * @param {String} name - service name
   * @param {Object} service - service object
   *
   * @return {Boolean}
   */
  checkDependencies(name, service) {
    if (!service.dependencies || service.dependencies.length === 0) {
      return true;
    }

    let resolved = true;

    this.getDependencyNames(service).forEach(dependency => {
      if (!(dependency in this.resolved)) {
        resolved = false;
      }

      if (!(dependency in this.services)) {
        this.promise.reject(new Error(
          'Dependency `' + dependency + '` on `' + name + '` was not found'
        ));
      }
    });

    return resolved;
  }

  checkConstraints() {

    this.checkNameConstraints(this.awaiting);

    this.awaiting.forEach(name => {
      const service = this.services[name];
      const dependencies = this.getDependencyNames(service);

      this.checkNameConstraints(dependencies);
    });

  }

  checkNameConstraints(dependencies) {

    dependencies.forEach(name => {
      if (name === 'require') {
        throw new Error('Service name `require` is forbidden');
      }

      if (name === 'requireDefault') {
        throw new Error('Service name `requireDefault` is forbidden');
      }
    });

  }

  getDependencyNames(service) {
    if (!service.dependencies) {
      return [];
    }

    return Array.isArray(service.dependencies) ?
      service.dependencies :
      this.constructor.values(service.dependencies);
  }

  obtainModule(name, service) {
    let serviceModule;

    try {
      serviceModule = service.module || this.requireDefault(service.path);
    } catch (error) {
      this.promise.reject(new Error(
        'Error occurs during module requiring (' + name + ').\n' + error.stack
      ));
    }

    return serviceModule;
  }

  obtainDepenedcies(name, service) {
    const imports = {
      require: this._require,
      requireDefault: this._requireDefault
    };

    if (!service.dependencies) {
      return imports;
    }

    if (Array.isArray(service.dependencies)) {
      service.dependencies.forEach(name => {
        imports[name] = this.resolved[name];
      });
    } else {
      Object.keys(service.dependencies).forEach(alias => {
        const name = service.dependencies[alias];
        imports[alias] = this.resolved[name];
      });
    }

    return imports;
  }

  /**
   * Start a given service.
   *
   * @private
   *
   * @param {String} name - service name
   * @param {Object} service - service object
   */
  startService(name, service) {
    const options = service.options || {};
    const imports = this.obtainDepenedcies(name, service);
    const serviceModule = this.obtainModule(name, service);

    if (!serviceModule) return;

    this.starting[name] = true;
    this.awaiting.splice(this.awaiting.indexOf(name), 1);

    try {
      const startupTimer = setTimeout(() => {
        this.promise.reject(new Error(
          'Timeout of startup module `' + name + '` exceeded'
        ));
      }, this.startupTimeout);

      serviceModule(options, imports)
        .then(result => {
          delete this.starting[name];
          clearTimeout(startupTimer);

          this.resolved[name] = result.service;
          this.teardown[name] = result.shutdown ||
            function () { return Promise.resolve(); };
          this.nextRound();
        });
    } catch (error) {
      this.promise.reject(new Error(
        `Error occurs during module "${name}" startup.\n` + error.stack
      ));
    }
  }

}
