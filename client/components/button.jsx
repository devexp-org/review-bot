import React from 'react';

import { Link } from 'react-router';

export default class Button {
    static propTypes = {
        action: React.PropTypes.func,
        children: React.PropTypes.node.isRequired,
        className: React.PropTypes.string,
        params: React.PropTypes.object,
        query: React.PropTypes.object,
        size: React.PropTypes.string,
        to: React.PropTypes.string,
        type: React.PropTypes.string,
        url: React.PropTypes.string
    };

    getType() {
        return this.props.type ?
            'btn-' + this.props.type :
            (this.props.url || this.props.to) ?
                'btn-link' :
                'btn-default';
    }

    getSize() {
        switch (this.props.size) {
            case 'l':
                return 'btn-lg';
            case 's':
                return 'btn-sm';
            case 'xs':
                return 'btn-xs';
            default:
                return '';
        }
    }

    getClassName() {
        var classes = ['btn'];

        classes.push(this.getType());
        classes.push(this.getSize());

        if (this.props.className) {
            classes.push(this.props.className);
        }

        return classes.join(' ');
    }

    render() {
        var className = this.getClassName();

        if (!this.props.url && !this.props.action && !this.props.to) {
            throw new Error('You should set at least url or action prop.');
        }

        if (this.props.to) {
            return (
                <Link className={ className }
                   params={ this.props.params }
                   query={ this.props.query }
                   to={ this.props.to }>
                        { this.props.children }
                </Link>
            );
        }

        if (this.props.url) {
            return (
                <a className={ className }
                   href={ this.props.url }>
                        { this.props.children }
                </a>
            );
        }

        return (
            <button
                className={ className }
                onClick={ this.props.action }>
                    { this.props.children }
            </button>
        );
    }
}
