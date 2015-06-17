import React from 'react';

export default class PullRequestList extends React.Component {
    getLabelType(state) {
        switch (state) {
            case 'open':
                return 'primary';
            default:
                return 'default';
        }
    }

    tableItems(list) {
        return list.map(item => {

            if (typeof item === 'string') {
                return (
                    <tr key={ item }>
                        <td colSpan='7'><h5>{ item }</h5></td>
                    </tr>
                );
            }

            return (
                <tr key={ item._id }>
                    <td>{ item.number }</td>
                    <td><a href={ item.html_url }>{ item.title }</a></td>
                    <td>{ item.user.login }</td>
                    <td><span className={ 'label label-' + this.getLabelType(item.state) }>{ item.state }</span></td>
                    <td>{ item.review.reviewers.length ? item.review.reviewers.join(', ') : 'Not specified' }</td>
                    <td>{ item.complexity || 'Not defined' }</td>
                    <td><button className='btn btn-default'>Start Review</button></td>
                </tr>
            );
        });
    }

    render() {
        return (
            <table className='table table-hover'>
                <thead>
                    <tr>
                        <th>#</th>
                        <th>Title</th>
                        <th>Author</th>
                        <th>Status</th>
                        <th>Reviewers</th>
                        <th>Complexity</th>
                        <th style={{ width: '1%' }}>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    { this.tableItems(this.props.items) }
                </tbody>
            </table>
        );
    }
}
