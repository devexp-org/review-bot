import React from 'react';

import Avatar from 'app/client/components/avatar/avatar.jsx';
import Button from 'app/client/components/button.jsx';

export default class Reviewer {
    static propTypes = {
        onClick: React.PropTypes.func.isRequired,
        reviewer: React.PropTypes.object.isRequired
    };

    render() {
        var reviewer = this.props.reviewer;

        if (!reviewer) return null;

        return (
            <div className='reviewer' key={ reviewer.login }>
                <div className='panel panel-default'>
                    <div className='panel-body'>
                        <div className='reviewer__avatar'>
                            <Avatar img={ reviewer.avatar }/>
                        </div>

                        <h5 className='reviewer__username'>
                            { reviewer.login } <span className='label label-success'>{ reviewer.rank }</span>
                        </h5>

                        <div className='reviewer__actions'>
                            <Button action={ this.props.onClick } size='s'>
                                Add to review
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}
