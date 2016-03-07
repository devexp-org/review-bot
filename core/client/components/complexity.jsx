import React from 'react';

import Label from 'client/components/label.jsx';
import ProgressBar from 'client/components/progressbar.jsx';

export default class Complexity {
    static propTypes = {
        pull: React.PropTypes.object
    };

    render() {
        if (!this.props.pull) return null;

        var complexity = this.props.pull.complexity,
            additions = this.props.pull.additions,
            commits = this.props.pull.commits,
            deletions = this.props.pull.deletions;

        if (!complexity) return (<p className='text-muted'>Not specified</p>);

        return (
            <div>
                <div className='text-muted'>Additions:&nbsp;<Label type='success'>{ additions }</Label></div>
                <div className='text-muted'>Deletions:&nbsp;<Label type='danger'>{ deletions }</Label></div>
                <div className='text-muted'>Commits:&nbsp;<Label type='info'>{ commits }</Label></div>
                <p>
                    <ProgressBar value={ complexity }/>
                </p>
            </div>
        );
    }
}
