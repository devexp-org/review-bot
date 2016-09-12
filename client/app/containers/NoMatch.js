import React from 'react';
import Helmet from 'react-helmet';

const NoMatch = () => {
  return (
    <div>
      <Helmet title="Not Found" />
      Page was not found
    </div>
  );
};

export default NoMatch;
