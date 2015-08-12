import React from 'react';
import { Link } from 'react-router';

export default class NavBarLink {
    static propTypes = {
        params: React.PropTypes.object,
        query: React.PropTypes.object,
        to: React.PropTypes.string
    };

    static contextTypes = {
        router: React.PropTypes.func
    };

    render() {
        var { router } = this.context,
            isActive = router.isActive(this.props.to, this.props.params, this.props.query),
            className = isActive ? 'active' : '';

        return (
            <li className={className}>
                <Link {...this.props}/>
            </li>
        );
    }
}
