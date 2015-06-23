import React from 'react';

import Avatar from 'app/client/components/avatar/avatar.jsx';

export default class ReviewersList {
    renderItem(item) {
        return (
            <div className='reviewers-list__item'>
                <div className='panel panel-default '>
                    <div className='panel-body'>
                        <div className='reviewers-list__item-avatar'>
                            <Avatar img={ item.avatar }/>
                        </div>
                        <h5 className='reviewers-list__item-username'>
                            { item.login } <span className='label label-success'>{ item.rank }</span>
                        </h5>
                        <div className='reviewers-list__item-actions'>
                            <button className='btn btn-default'>Add to review</button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    render() {
        var reviewers = this.props.list || [];

        if (!reviewers) return null;

        return (
            <div className='reviewers-list'>
                { reviewers.map(this.renderItem) }
            </div>
        );
    }
}
