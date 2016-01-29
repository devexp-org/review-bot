import React from 'react';

export default class ProgressBar {
    static propTypes = {
        value: React.PropTypes.number
    };

    color(val) {
        if (val < 40) {
            return 'success';
        } else if (val >= 40 && val < 70) {
            return 'warning';
        }

        return 'danger';
    }

    render() {
        var val = this.props.value || 0,
            className = 'progress-bar progress-bar-';

        className += this.color(val);

        return (
            <div className='progress'>
                <div className={ className } style={{ width: this.props.value + '%' }}></div>
            </div>
        );
    }
}
