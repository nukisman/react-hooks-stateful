import React, { FC, useState } from 'react';

import ExampleComponent from 'react-dep-state';

const App: FC = () => {
  const [s] = useState(1);
  // const f = () => {
  //   const [x] = useState(1);
  // };
  return (
    <div>
      <ExampleComponent text="Rollup TypeScript TSLint React component module" />
    </div>
  );
};

export default App;
