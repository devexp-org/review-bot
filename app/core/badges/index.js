export default {
    types: {},
    style: 'flat',

    init(options) {
        this.types = options.types;
        this.url = options.url;
        this.style = options.style || 'flat';
    },

    create(type, ...rest) {
        if (!this.types[type]) throw new Error(`Badge with type ${type} doesn't exists!`);

        var {
            subject,
            status,
            color
        } = this.types[type].apply(this, rest);

        return `<img src="${this.url}${subject}-${status}-${color}.svg?style=${this.style}" />`;
    }
};
