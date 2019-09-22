import React, { ChangeEvent, FC } from 'react';

import { useInState } from 'react-dep-state';

import { useDepWidth } from 'react-dep-state/responsive';

const App: FC = () => {
  const name = useInState('Alex');
  const width = useDepWidth();
  const updateName = (e: ChangeEvent<HTMLInputElement>) =>
    name.set(e.target.value);
  return (
    <>
      <input defaultValue={name.state} onChange={updateName} />
      <div>name: {name.state}</div>
      <div>width: {width.state}</div>
    </>
  );
};

export default App;
