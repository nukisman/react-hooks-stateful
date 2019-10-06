import React, { ChangeEvent, FC } from 'react';
import {
  useInput,
  Stateful,
  useWindowSize,
  useProp,
  useString,
  useSum,
  useProd,
  reuseProp,
  reusePropOf,
  useWindowWidth
} from 'react-dep-state';

/** Width of some type defined later */
const useWidth = reuseProp('width');

/** Width of number */
const useWidthOfNumber = reusePropOf('width')<number>();

const App: FC = () => {
  const name = useInput('Alex');
  const size = useWindowSize();
  const ww: Stateful<number> = useWindowWidth();
  const updateName = (e: ChangeEvent<HTMLInputElement>) =>
    name.set(e.target.value);
  const width = useWidth<number>(size);
  const width_: Stateful<number> = useWidth(size);
  const width__ = useWidthOfNumber(size);
  /** For type checking */
  const widthCube = useSum(width, width_, width__);
  /** No lambda generation. Single declaration of prop name and type */
  const height: Stateful<number> = useProp('height', size);
  const semiPerimeter = useSum(width, height);
  const square = useProd(width, height);
  const str = useString`Hello ${name}! width = ${width}, num: ${width.state}`;
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
        ww: {ww.state}
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
