import React, { PropTypes, Component } from 'react';
import { Link } from 'react-router';
import Helmet from 'react-helmet';

class App extends Component {

  render() {
    return (
      <div>
        <Helmet
          title="MyApp"
          titleTemplate="MyApp - %s"
          meta={[
            { charset: 'utf-8' },
            { name: 'description', content: 'My super dooper dope app' }
          ]}
        />
        <nav>
          <ul>
            <li><Link to="/">Users</Link></li>
          </ul>
        </nav>
        {this.props.children}
      </div>
    );
  }
}

App.propTypes = {
  children: PropTypes.node
};

export default App;
