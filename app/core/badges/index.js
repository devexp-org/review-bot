module.exports = {
    types: {},
    style: '',

    init: function init(options) {
        this.url = options.url;
        this.style = options.style || 'flat';
    },

    create: function create(subject, status, color, url) {
        if (!subject) throw new Error('Badge should have at least subject!');

        color = color || 'lightgrey';
        status = status || '...';

        var img = '<img src="' + this.url + subject + '-' + status + '-' + color + '.svg?style=' + this.style + '" />';

        if (url) {
            return '<a href="' + url + '">' + img + '</a>';
        }

        return img;
    }
};
