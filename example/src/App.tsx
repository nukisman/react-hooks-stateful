import React, { Component } from 'react';

import ExampleComponent from 'react-dep-state';

export default class App extends Component {
  render() {
    return (
      <div>
        <ExampleComponent text="Rollup TypeScript React component module" />
      </div>
    );
  }
}
