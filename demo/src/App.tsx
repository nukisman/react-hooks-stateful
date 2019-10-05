import React, { ChangeEvent, FC } from 'react';

import { useInState } from 'react-dep-state';

import { useWindowSize, Size } from 'react-dep-state/responsive';
import { constState } from 'react-dep-state/main';
import {
  useProp,
  useString,
  useSum,
  useProd,
  reuseProp
} from 'react-dep-state/operator';

const useWidth = reuseProp<'width', Size>(constState('width'));

const App: FC = () => {
  const name = useInState('Alex');
  const size = useWindowSize();
  const updateName = (e: ChangeEvent<HTMLInputElement>) =>
    name.set(e.target.value);
  const width = useWidth(size);
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
