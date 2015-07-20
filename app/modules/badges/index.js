export default {
    types: {},
    style: '',

    /**
     * Init for badges module.
     *
     * @param {Object} options
     * @param {String} options.url
     * @param {String} [options.style] - style for badges, default: flat
     */
    init(options) {
        this.url = options.url;
        this.style = options.style || 'flat';
    },

    /**
     * Creates badge. [subject|status].
     *
     * @param {String} subject
     * @param {String} status
     * @param {String} color - color of badge
     * @param {String} url - url from badge
     *
     * @returns {String} img or a tag with propper url and img src.
     */
    create(subject, status, color, url) {
        if (!subject) throw new Error('Badge should have at least subject!');

        color = color || 'lightgrey';
        status = status || '...';

        subject = subject.replace(/-/g, '--');
        status = status.replace(/-/g, '--');

        const img = `<img src="${this.url}${subject}-${status}-${color}.svg?style=${this.style}" />`;

        if (url) {
            return `<a href="${url}">${img}</a>`;
        }

        return img;
    }
};
