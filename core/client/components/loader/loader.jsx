import style from './loader.scss'; // eslint-disable-line
import React from 'react';

export default class Loader {
    static propTypes = {
        active: React.PropTypes.bool.isRequired,
        centered: React.PropTypes.bool,
        size: React.PropTypes.string
    };

    render() {
        var className = '';

        if (this.props.active) {
            className += ' active';
        }

        if (this.props.centered) {
            className += ' centered';
        }

        className += this.props.size ? this.props.size : ' big';

        return (
            <div className={ 'preloader-wrapper ' + className }>
                <div className='spinner-layer spinner-blue-only'>
                    <div className='circle-clipper left'>
                        <div className='circle'></div>
                    </div>
                    <div className='gap-patch'>
                        <div className='circle'></div>
                    </div>
                    <div className='circle-clipper right'>
                        <div className='circle'></div>
                    </div>
                </div>
            </div>
        );
    }
}
