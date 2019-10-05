import React, { ChangeEvent, FC } from 'react';

import { useInState, constState, State } from 'react-dep-state';

import { useWindowSize } from 'react-dep-state/responsive';
import {
  useProp,
  useString,
  useSum,
  useProd,
  reuseProp,
  reusePropOf
} from 'react-dep-state/operator';

/** Width of some type defined later */
const useWidth = reuseProp(constState('width'));

/** Width of number */
const useWidthOfNumber = reusePropOf(constState('width'))<number>();

const App: FC = () => {
  const name = useInState('Alex');
  const size = useWindowSize();
  const updateName = (e: ChangeEvent<HTMLInputElement>) =>
    name.set(e.target.value);
  const width = useWidth<number>(size);
  const width_: State<number> = useWidth(size);
  const width__ = useWidthOfNumber(size);
  /** For type checking */
  const widthCube = useSum(width, width_, width__);
  /** No lambda generation. Single declaration of prop name and type */
  const height: State<number> = useProp(constState('height'), size);
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
