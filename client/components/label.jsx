import React from 'react';

export default class Label {
    static propTypes = {
        children: React.PropTypes.node.isRequired,
        className: React.PropTypes.string,
        type: React.PropTypes.string,
        url: React.PropTypes.string
    };

    render() {
        var className = ['label'];

        className.push(
            this.props.type ? 'label-' + this.props.type : 'label-default'
        );

        if (this.props.className) {
            className.push(this.props.className);
        }

        if (this.props.url) {
            return (
                <a className={ className.join(' ') } href={ this.props.url }>{ this.props.children }</a>
            );
        }

        return (
            <span className={ className.join(' ') }>{ this.props.children }</span>
        );
    }
}
