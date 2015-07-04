import _ from 'lodash';

export default {
    extenders: {},
    hooks: {},

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
        this.extenders = options.extenders;
        this.hooks = options.hooks;

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
        var extenders = this.get(model).extenders;

        _.forEach(extenders, extender => _.extend(baseSchema, extender));

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
        var hooks = this.get(model).hooks;

        if (hooks.preSave) {
            schema.pre('save', function (next) {
                var hooksPromiseList = [];

                _.forEach(hooks.preSave, hook => hooksPromiseList.push(hook(this)));

                Promise.all(hooksPromiseList).then(next);
            });
        }

        return this;
    }
};
