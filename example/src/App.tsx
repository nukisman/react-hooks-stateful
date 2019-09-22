import React, { ChangeEvent, FC } from 'react';

import { useInState } from 'react-dep-state';

import { useWindowSize } from 'react-dep-state/responsive';

const App: FC = () => {
  const name = useInState('Alex');
  const size = useWindowSize();
  const updateName = (e: ChangeEvent<HTMLInputElement>) =>
    name.set(e.target.value);
  return (
    <>
      <input defaultValue={name.state} onChange={updateName} />
      <div>name: {name.state}</div>
      <div>
        size: {size.state.width} x {size.state.height}
      </div>
    </>
  );
};

export default App;
