import React from 'react';

import Button from 'app/client/components/button.jsx';
import Label from 'app/client/components/label.jsx';
import ReviewerCell from 'app/client/components/review/reviewer-cell.jsx';
import TimeAgo from 'react-timeago';

import statusToColor from 'app/client/utils/status-to-color-mapper';

export default class PullRequestList extends React.Component {
    static propTypes = {
        items: React.PropTypes.object.isRequired
    };

    tableItems(list) {
        return list.map((item) => {
            return (
                <tr key={ item._id }>
                    <td>{ item.number }</td>
                    <td><a href={ item.html_url }>{ item.title }</a></td>
                    <td><a href={ item.user.html_url }>{ item.user.login }</a></td>
                    <td><TimeAgo date={ item.updated_at }/></td>
                    <td>
                        <Label type={ statusToColor(item.state) }>pr: { item.state }</Label><br/>

                        <Label
                            type={ statusToColor(item.review.status) }>
                                review: { item.review.status || 'not started yet' }
                        </Label>
                    </td>
                    <td><ReviewerCell reviewers={ item.review.reviewers } /></td>
                    <td>{ item.complexity || 'Not defined' }</td>
                    <td><Button to={ '/review/' + item._id }>Review</Button></td>
                </tr>
            );
        });
    }

    render() {
        return (
            <div>
                { Object.keys(this.props.items).map((key) => {
                    return (
                        <div className='panel panel-default' key={ key }>
                            <div className='panel-heading'>{ key }</div>

                            <table className='table table-hover'>
                                <thead>
                                    <tr>
                                        <th>#</th>
                                        <th>Title</th>
                                        <th>Author</th>
                                        <th>Updated</th>
                                        <th>Statuses</th>
                                        <th>Reviewers</th>
                                        <th>Complexity</th>
                                        <th style={{ width: '1%' }}>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    { this.tableItems(this.props.items[key]) }
                                </tbody>
                            </table>
                        </div>
                    );
                }) }
            </div>
        );
    }
}
