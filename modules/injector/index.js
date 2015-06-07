var _ = require('lodash');

/**
 *
 * Dumb dependency injection module.
 *
 */
function Injector() {
    this._modules = Object.create(null);
    this._options = Object.create(null);
}

/**
 * Register module for futher using.
 * Calls initImmediately() method of given module if this method exists (May depend on order of registering).
 *
 * @param {String} name — module name
 * @param {Object} module
 * @param {Object} [options] — options which will be passed to module
 *
 * @return {Injector}
 */
Injector.prototype.register = function (name, module, options) {
    if (name in this._modules) {
        throw new Error('Module with name: "' + name + '" already registered.');
    }

    this._modules[name] = module;

    if (options && (!module.init && !module.initImmediately))
        throw new Error('Options was passed for module "' + name + '" but there isn`t init method in it.');

    if (options && !module.initImmediately)
        this._options[name] = options;

    if (module.initImmediately)
        module.initImmediately(options || {});

    return this;
};

/**
 * Init registered modules.
 *
 * @return {Injector}
 */
Injector.prototype.initModules = function () {
    _.forEach(this._modules, function (module, name) {
        if (module.init)
            module.init(this._options[name] || {});
    }, this);

    // Clear options because no longer needed.
    this._options = undefined;

    return this;
};

/**
 * Returns module if it was registerd.
 *
 * @param  {String} name — module name
 *
 * @return {Object} module
 */
Injector.prototype.get = function (name) {
    if (!(name in this._modules)) {
        throw new Error('Module with name: "' + name + '" has not been registred.');
    }

    return this._modules[name];
};

module.exports = new Injector();
