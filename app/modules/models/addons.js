import _ from 'lodash';

export default {
    hooks: {},
    extenders: {},

    /**
     * Register extenders and hooks for models.
     *
     * @param {Object} options
     * @param {Object} options.extenders — objects which extends models.
     * @param {Object} options.hooks — objects which extends models.
     *
     * @returns {this}
     */
    init(options) {
        this.extenders = options.extenders || {};
        this.hooks = options.hooks || {};

        return this;
    },

    /**
     * Returns extenders and hooks for given model
     *
     * @param {String} model - model name.
     *
     * @returns {Object}
     */
    get(model) {
        return {
            extenders: this.extenders[model] || [],
            hooks: this.hooks[model] || []
        };
    },

    /**
     * Setup model extenders.
     *
     * @param {String} model - model name.
     * @param {Object} baseSchema - model base schema.
     *
     * @returns {this}
     */
    setupExtenders(model, baseSchema) {
        const extenders = this.get(model).extenders;

        _.forEach(extenders, function (extender) {
            _.extend(baseSchema, extender);
        });

        return this;
    },

    /**
     * Setup model pre save hooks.
     *
     * @param {String} model - model name.
     * @param {Object} schema - mongoose schema.
     *
     * @returns {this}
     */
    setupHooks(model, schema) {
        const hooks = this.get(model).hooks;

        if (hooks.preSave) {
            schema.pre('save', function (next) {
                const _this = this;
                const hooksPromiseList = [];

                _.forEach(hooks.preSave, function (hook) {
                    hooksPromiseList.push(hook(_this));
                });

                Promise.all(hooksPromiseList).then(next);
            });
        }

        return this;
    }
};
