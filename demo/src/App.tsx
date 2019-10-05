import React, { ChangeEvent, FC } from 'react';

import { useInState } from 'react-dep-state';

import { useWindowSize } from 'react-dep-state/responsive';
import { constState } from 'react-dep-state/main';
import { useProp, useString, useSum, useProd } from 'react-dep-state/operator';

const App: FC = () => {
  const name = useInState('Alex');
  const size = useWindowSize();
  const updateName = (e: ChangeEvent<HTMLInputElement>) =>
    name.set(e.target.value);
  const width = useProp(constState<'width'>('width'), size);
  const height = useProp(constState<'height'>('height'), size);
  const semiPerimeter = useSum(width, height);
  const square = useProd(width, height);
  const str = useString`Hello ${name}! width = ${width}`;
  return (
    <>
      <h4>Example: react-dep-state</h4>
      <input defaultValue={name.state} onChange={updateName} />
      <div>name: {name.state}</div>
      <br />
      <div>
        Window:
        <br />
        size: {size.state.width} x {size.state.height} px
        <br />
        size.width: {width.state} px
        <br />
        size.height: {height.state} px
        <br />
        Semi-perimeter: {semiPerimeter.state} px
        <br />
        Square: {square.state} px^2
      </div>
      <br />
      <div>Str: {str.state}</div>
    </>
  );
};

export default App;
