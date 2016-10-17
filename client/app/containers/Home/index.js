import React, { Component } from 'react';
import Helmet from 'react-helmet';

import './index.css';

class Home extends Component {

  render() {
    return (
      <div>
        <Helmet title="Home" />
        {this.props.children}
      </div>
    );
  };

}

export default Home;
